using equipment.requests as db from '../db/schema';

service RequestService {
  entity Equipment as projection on db.Equipment;

  entity Requests  as projection on db.Request
    actions {
      action submit();
      action approve();
      action reject(reason: String);
    };
}

annotate RequestService.Requests with {
  status          @readonly;
  rejectionReason @readonly;
};
