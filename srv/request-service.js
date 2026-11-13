import cds from "@sap/cds";

export default class RequestService extends cds.ApplicationService {
  init() {
    const { Requests } = this.entities;
    async function transition(req, from, to, extra = {}) {
      const { ID } = req.params[0];
      const request = await SELECT.one.from(Requests).where({ ID });
      if (!request) return req.reject(404, "Request not found");
      if (request.status !== from)
        return req.reject(400, `Only ${from} is allowed to move to ${to}`);
      await UPDATE(Requests, ID).with({ status: to, ...extra });
      return SELECT.one.from(Requests).where({ ID });
    }

    this.on("submit", "Requests", (req) => transition(req, "New", "Submitted"));
    this.on("approve", "Requests", (req) =>
      transition(req, "Submitted", "Approved"),
    );
    this.on("reject", "Requests", (req) => {
      if (!req.data.reason) return req.reject(400, "Rejection reason required");
      return transition(req, "Submitted", "Rejected", {
        rejectionReason: req.data.reason,
      });
    });
    return super.init();
  }
}
