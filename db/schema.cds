namespace equipment.requests;

using {cuid, managed} from '@sap/cds/common';

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
  criticality     : Integer = case
                                status
                                when 'Approved'
                                     then 3
                                when 'Submitted'
                                     then 2
                                when 'Rejected'
                                     then 1
                                when 'New'
                                     then 0
                                else 0
                              end;
}

entity Statuses {
  key code : RequestStatus;
}
