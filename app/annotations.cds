using RequestService from '../srv/request-service';

annotate RequestService.Requests with @(
  UI.LineItem            : [
    {Value: equipment_ID},
    {Value: quantity},
    {Value: reason},
    {
      Value      : status,
      Criticality: criticality
    },
    {Value: createdBy},
  ],
  UI.SelectionFields     : [
    status,
    createdBy,
    equipment_ID
  ],
  UI.HeaderInfo          : {
    TypeName      : 'Request',
    TypeNamePlural: 'Requests',
    Title         : {Value: equipment_ID},
    Description   : {Value: createdBy},
  },
  UI.FieldGroup #General : {Data: [
    {Value: equipment_ID},
    {Value: quantity},
    {Value: reason}
  ], },
  UI.FieldGroup #Decision: {Data: [
    {
      Value      : status,
      Criticality: criticality
    },
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
  quantity        @title: 'Quantity';
  equipment       @title : 'Equipment'
                  @Common: {
    Text           : equipment.name,
    TextArrangement: #TextOnly,
    ValueList      : {
      CollectionPath: 'Equipment',
      Parameters    : [
        {
          $Type            : 'Common.ValueListParameterInOut',
          LocalDataProperty: equipment_ID,
          ValueListProperty: 'ID',
        },
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'name',
        },
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'stock',
        },
      ],
    }
  };
  rejectionReason @title: 'Rejection Reason';
  status          @title : 'Status'
                  @Common: {
    ValueList: {
      CollectionPath: 'Statuses',
      Parameters    : [{
        $Type            : 'Common.ValueListParameterInOut',
        LocalDataProperty: status,
        ValueListProperty: 'code',
      }],
    },
    ValueListWithFixedValues,
  };
  criticality     @UI.Hidden;
}

annotate RequestService.Equipment with {
  name @title: 'Equipment'
}
