setStepName("VSTGM Maintenance");
open("http://localhost:3010/api/v2/scheduled-maintenances/active.json");

var extract2 = Catchpoint.extract("resp-content", "(.*)");
var json_content2 = JSON.parse(extract2);
var maintenance = (json_content2.scheduled_maintenances || []).length;

open("https://www.google.com/search?q=" + maintenance);
