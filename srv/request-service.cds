using equipment.requests as db from '../db/schema';

service RequestService {
  entity Equipment as projection on db.Equipment;

  entity Requests  as projection on db.Request
    actions {
      action submit()               returns Requests;
      action approve()              returns Requests;
      action reject(reason: String) returns Requests;
    };
}

annotate RequestService.Requests with @(restrict: [
  {
    grant: ['CREATE'],
    to   : 'Employee'
  },
  {
    grant: [
      'READ',
      'UPDATE',
      'submit'
    ],
    to   : 'Employee',
    where: 'createdBy = $user'
  },
  {
    grant: [
      'READ',
      'approve',
      'reject'
    ],
    to   : 'Manager'
  },
  {
    grant: '*',
    to   : 'Admin'
  }
]);

annotate RequestService.Equipment with @(restrict: [
  {
    grant: 'READ',
    to   : [
      'Employee',
      'Manager',
      'Admin'
    ]
  },
  {
    grant: '*',
    to   : 'Admin'
  }
]);

annotate RequestService.Requests with {
  status          @readonly;
  rejectionReason @readonly;
};
