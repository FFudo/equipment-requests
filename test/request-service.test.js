import cds from "@sap/cds";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const { GET, POST, PATCH } = cds.test(import.meta.dirname + "/..");

const as = (user) => ({ auth: { username: user, password: user } });
const path = "/odata/v4/request";
const actionURL = (requestID, action) =>
  `${path}/Requests(${requestID})/RequestService.${action}`;

async function createEquipment(stock = 10) {
  const { data } = await POST(
    `${path}/Equipment`,
    { name: "Laptop", stock },
    as("carol"),
  );
  return data;
}

async function createRequest(equipmentID, quantity = 1) {
  const { data } = await POST(
    `${path}/Requests`,
    {
      equipment_ID: equipmentID,
      quantity,
      reason: "New hire laptop",
    },
    as("alice"),
  );
  return data;
}

async function createSubmittedRequest(equipmentID, quantity = 1) {
  const request = await createRequest(equipmentID, quantity);
  await POST(actionURL(request.ID, "submit"), {}, as("alice"));
  return request;
}

async function getStock(equipmentID) {
  const { data } = await GET(`${path}/Equipment(${equipmentID})`, as("carol"));
  return data.stock;
}

describe("RequestService", () => {
  it("rejects unknown users with 401", async () => {
    await assert.rejects(GET(`${path}/Requests`, as("eve")), { status: 401 });
  });

  it("lets an Admin create equipment", async () => {
    const { data, status } = await POST(
      `${path}/Equipment`,
      { name: "Laptop", stock: 10 },
      as("carol"),
    );
    assert.equal(status, 201);
    assert.equal(data.stock, 10);
  });

  it("Employee cannot create equipment -> 403", async () => {
    await assert.rejects(
      POST(
        `${path}/Equipment`,
        { name: "Hacked item", stock: 999 },
        as("alice"),
      ),
      { status: 403 },
    );
  });

  it("Employee creates a request in status New", async () => {
    const equipment = await createEquipment(10);
    const { status, data } = await POST(
      `${path}/Requests`,
      {
        equipment_ID: equipment.ID,
        quantity: 1,
        reason: "New hire laptop",
      },
      as("alice"),
    );
    assert.equal(status, 201);
    assert.equal(data.status, "New");
    assert.equal(data.createdBy, "alice");
  });

  it("Employee only sees their own requests", async () => {
    const equipment = await createEquipment(10);
    const own = await createRequest(equipment.ID);
    const { data: other } = await POST(
      `${path}/Requests`,
      { equipment_ID: equipment.ID, quantity: 1, reason: "Admin request" },
      as("carol"),
    );

    const { data } = await GET(`${path}/Requests`, as("alice"));
    const ids = data.value.map((r) => r.ID);

    assert.ok(ids.includes(own.ID), "alice should see her own request");
    assert.ok(!ids.includes(other.ID), "alice must not see carol's request");
  });

  it("Employee submits own request -> Submitted", async () => {
    const equipment = await createEquipment(10);
    const request = await createRequest(equipment.ID);
    const { status, data } = await POST(
      `${path}/Requests(${request.ID})/RequestService.submit`,
      {},
      as("alice"),
    );
    assert.equal(status, 200);
    assert.equal(data.status, "Submitted");
    assert.equal(data.createdBy, "alice");
  });

  it("submitting the same request twice -> 400", async () => {
    const equipment = await createEquipment(10);
    const request = await createSubmittedRequest(equipment.ID);

    await assert.rejects(
      POST(actionURL(request.ID, "submit"), {}, as("alice")),
      { status: 400 },
    );
  });

  it("Employee cannot approve -> 403", async () => {
    const equipment = await createEquipment(10);
    const request = await createSubmittedRequest(equipment.ID);

    await assert.rejects(
      POST(actionURL(request.ID, "approve"), {}, as("alice")),
      { status: 403 },
    );
  });

  it("Manager cannot create a request -> 403", async () => {
    const equipment = await createEquipment(10);

    await assert.rejects(
      POST(
        `${path}/Requests`,
        { equipment_ID: equipment.ID, quantity: 1, reason: "Nope" },
        as("bob"),
      ),
      { status: 403 },
    );
  });

  it("Manager approves -> Approved and stock is reduced", async () => {
    const equipment = await createEquipment(10);
    const request = await createSubmittedRequest(equipment.ID, 3);

    const { status, data } = await POST(
      actionURL(request.ID, "approve"),
      {},
      as("bob"),
    );

    assert.equal(status, 200);
    assert.equal(data.status, "Approved");
    assert.equal(await getStock(equipment.ID), 7);
  });

  it("approving more than the stock -> 409, stock unchanged", async () => {
    const equipment = await createEquipment(2);
    const request = await createSubmittedRequest(equipment.ID, 5);

    await assert.rejects(
      POST(actionURL(request.ID, "approve"), {}, as("bob")),
      { status: 409 },
    );

    assert.equal(await getStock(equipment.ID), 2);
    const { data } = await GET(`${path}/Requests(${request.ID})`, as("bob"));
    assert.equal(data.status, "Submitted");
  });

  it("editing a request after submit -> 400", async () => {
    const equipment = await createEquipment(10);
    const request = await createSubmittedRequest(equipment.ID);

    await assert.rejects(
      PATCH(
        `${path}/Requests(${request.ID})`,
        { reason: "Sneaky edit" },
        as("alice"),
      ),
      { status: 400 },
    );
  });

  it("quantity 0 -> 400", async () => {
    const equipment = await createEquipment(10);

    await assert.rejects(createRequest(equipment.ID, 0), { status: 400 });
  });

  it("reject without reason -> 400", async () => {
    const equipment = await createEquipment(10);
    const request = await createSubmittedRequest(equipment.ID);

    await assert.rejects(POST(actionURL(request.ID, "reject"), {}, as("bob")), {
      status: 400,
    });
  });

  it("reject with reason -> Rejected, rejectionReason set", async () => {
    const equipment = await createEquipment(10);
    const request = await createSubmittedRequest(equipment.ID);

    const { status, data } = await POST(
      actionURL(request.ID, "reject"),
      { reason: "Needs more explanation for need." },
      as("bob"),
    );

    assert.equal(status, 200);
    assert.equal(data.status, "Rejected");
    assert.equal(data.rejectionReason, "Needs more explanation for need.");
  });
});
