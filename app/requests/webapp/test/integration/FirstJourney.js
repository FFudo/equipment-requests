sap.ui.define([
    "sap/ui/test/opaQunit",
    "./pages/JourneyRunner"
], function (opaTest, runner) {
    "use strict";

    function journey() {
        QUnit.module("First journey");

        opaTest("Start application", function (Given, When, Then) {
            Given.iResetMockData({ ServiceUri: "/odata/v4/request/" });
            Given.iResetTestData();
            Given.iStartMyApp();
            Then.onTheRequestsListGenerated.iSeeThisPage();
        });


        opaTest("Navigate to ObjectPage", function (Given, When, Then) {
            // Note: this test will fail if the ListReport page doesn't show any data
            
            When.onTheRequestsListGenerated.onFilterBar().iExecuteSearch();
            
            Then.onTheRequestsListGenerated.onTable().iCheckRows();

            When.onTheRequestsListGenerated.onTable().iPressRow(0);
            Then.onTheRequestsObjectPageGenerated.iSeeThisPage();

        });

        opaTest("Teardown", function (Given, When, Then) { 
            // Cleanup
            Given.iTearDownMyApp();
        });
    }

    runner.run([journey]);
});