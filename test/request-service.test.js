import cds from "@sap/cds";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

// Starts the CAP server in-process (with an in-memory SQLite DB) for this file.
const { GET, POST } = cds.test(import.meta.dirname + "/..");

const as = (user) => ({ auth: { username: user, password: user } });
const path = "/odata/v4/request";

describe("RequestService", () => {
  // Example: a failing request throws an error that carries the HTTP status.
  it("rejects unknown users with 401", async () => {
    await assert.rejects(GET(`${path}/Requests`, as("eve")), { status: 401 });
  });

  // Example: a successful request returns { status, data }.
  it("lets an Admin create equipment", async () => {
    const { status, data } = await POST(
      `${path}/Equipment`,
      { name: "MacBook Pro 14", stock: 10 },
      as("carol"),
    );
    assert.equal(status, 201);
    assert.equal(data.stock, 10);
  });

  // TODO: turn these into real tests (scenarios from test/test.http).
  it.todo("Employee creates a request in status New");
  it.todo("Employee only sees their own requests");
  it.todo("Employee submits own request -> Submitted");
  it.todo("submitting the same request twice -> 400");
  it.todo("Employee cannot approve -> 403");
  it.todo("Manager cannot create a request -> 403");
  it.todo("Manager approves -> Approved and stock is reduced");
  it.todo("approving more than the stock -> 409, stock unchanged");
  it.todo("editing a request after submit -> 400");
  it.todo("quantity 0 -> 400");
  it.todo("reject without reason -> 400");
  it.todo("reject with reason -> Rejected, rejectionReason set");
});
