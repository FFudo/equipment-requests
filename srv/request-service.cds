using equipment.requests as db from '../db/schema';

service RequestService {
  entity Equipment as projection on db.Equipment;
  entity Requests  as projection on db.Request;
}
