setStepName("VSTGM Maintenance");
open("https://www.vstgm.co.in/api/v2/scheduled-maintenances/active.json");
var extract2 = Catchpoint.extract("resp-content", "(.*)");
var json_content2 = JSON.parse(extract2);
var maintenance = (json_content2.scheduled_maintenances || []).length;
setIndicator("main1", maintenance);
setIndicator("main2", maintenance);

setStepName("Opening Google");
open("https://www.google.com/search?q=" + maintenance);
pause(5000);