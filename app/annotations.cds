using RequestService from '../srv/request-service';

annotate RequestService.Requests with @(
  UI.LineItem            : [
    {Value: equipment.name},
    {Value: quantity},
    {Value: reason},
    {Value: status},
    {Value: createdBy},
  ],
  UI.SelectionFields     : [
    status,
    createdBy
  ],
  UI.HeaderInfo          : {
    TypeName      : 'Request',
    TypeNamePlural: 'Requests',
    Title         : {Value: equipment.name},
    Description   : {Value: createdBy},
  },
  UI.FieldGroup #General : {Data: [
    {Value: equipment.name},
    {Value: quantity},
    {Value: reason}
  ], },
  UI.FieldGroup #Decision: {Data: [
    {Value: status},
    {Value: rejectionReason},
  ], },
  UI.FieldGroup #Admin   : {Data: [
    {Value: createdBy},
    {Value: createdAt},
    {Value: modifiedBy},
    {Value: modifiedAt},
  ], },
  UI.Facets              : [
    {
      $Type : 'UI.ReferenceFacet',
      ID    : 'General',
      Label : 'General Information',
      Target: '@UI.FieldGroup#General',
    },
    {
      $Type : 'UI.ReferenceFacet',
      ID    : 'Decision',
      Label : 'Decision Information',
      Target: '@UI.FieldGroup#Decision',
    },
    {
      $Type : 'UI.ReferenceFacet',
      ID    : 'Admin',
      Label : 'Administrative Data',
      Target: '@UI.FieldGroup#Admin',
    },
  ],
);

annotate RequestService.Requests with {
  reason          @title: 'Reason';
  status          @title: 'Status';
  quantity        @title: 'Quantity';
  equipment       @title: 'Equipment';
  rejectionReason @title: 'Rejection Reason';
}

annotate RequestService.Equipment with {
  name @title: 'Equipment';
}
