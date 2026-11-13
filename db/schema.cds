namespace equipment.requests;

using {
  cuid,
  managed
} from '@sap/cds/common';

type RequestStatus : String enum {
  New;
  Submitted;
  Approved;
  Rejected;
}

entity Equipment : cuid, managed {
  name  : String(100) @mandatory;
  stock : Integer default 0;
}

entity Request : cuid, managed {
  equipment       : Association to Equipment @mandatory;
  quantity        : Integer default 1;
  reason          : String(500);
  status          : RequestStatus default 'New';
  rejectionReason : String(250);
}
