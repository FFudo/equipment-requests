using RequestService from '../srv/request-service';

annotate RequestService.Requests with @(
  UI.LineItem       : [
    {Value: equipment.name},
    {Value: quantity},
    {Value: reason},
    {Value: status},
  ],
  UI.SelectionFields: [
    status,
    createdBy
  ],
);

annotate RequestService.Requests with {
  reason          @title: 'Reason';
  status          @title: 'Status';
  createdBy       @title: 'Creator';
  quantity        @title: 'Quantity';
  equipment       @title: 'Equipment';
  rejectionReason @title: 'Rejection Reason';
}

annotate RequestService.Equipment with {
  name @title: 'Equipment';
}
