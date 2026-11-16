import cds from "@sap/cds";

export default class RequestService extends cds.ApplicationService {
  init() {
    const { Requests, Equipment } = this.entities;

    // load in status from request and validate it
    async function loadInStatus(req, from, to) {
      const { ID } = req.params[0];
      const request = await SELECT.one.from(Requests).where({ ID });
      if (!request) return req.reject(404, "Request not found");
      if (request.status !== from)
        return req.reject(400, `Only ${from} is allowed to move to ${to}`);
      return request;
    }

    async function setStatus(ID, status, extra = {}) {
      await UPDATE(Requests, ID).with({ status: status, ...extra });
      return SELECT.one.from(Requests).where({ ID });
    }

    // Actions

    this.on("submit", "Requests", async (req) => {
      const status = "Submitted";
      const request = await loadInStatus(req, "New", status);
      return setStatus(request.ID, status);
    });

    this.on("approve", "Requests", async (req) => {
      const status = "Approved";
      const request = await loadInStatus(req, "Submitted", status);

      const affected = await UPDATE(Equipment)
        .with({ stock: { "-=": request.quantity } })
        .where({ ID: request.equipment_ID, stock: { ">=": request.quantity } });

      if (!affected)
        return req.reject(409, "Not enough stock to approve this request");

      return setStatus(request.ID, status);
    });

    this.on("reject", "Requests", async (req) => {
      const status = "Rejected";
      if (!req.data.reason?.trim())
        return req.reject(400, "Rejection reason required");
      const request = await loadInStatus(req, "Submitted", status);
      return setStatus(request.ID, status, {
        rejectionReason: req.data.reason,
      });
    });

    this.before(["UPDATE", "DELETE"], "Requests", async (req) => {
      const { ID } = req.data;
      const existing = await SELECT.one
        .from(Requests)
        .columns("status")
        .where({ ID });
      if (existing && existing.status !== "New")
        return req.reject(
          400,
          "Only requests in status New can be changed or deleted",
        );
    });

    return super.init();
  }
}
