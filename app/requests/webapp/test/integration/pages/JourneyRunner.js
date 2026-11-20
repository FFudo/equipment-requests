sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"requests/test/integration/pages/RequestsList.gen",
	"requests/test/integration/pages/RequestsObjectPage.gen"
], function (JourneyRunner, RequestsListGenerated, RequestsObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('requests') + '/test/flp.html#app-preview',
        pages: {
			onTheRequestsListGenerated: RequestsListGenerated,
			onTheRequestsObjectPageGenerated: RequestsObjectPageGenerated
        },
        async: true
    });

    return runner;
});

