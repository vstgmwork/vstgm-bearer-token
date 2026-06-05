setStepName("VSTGM Status Tracking");
open("https://www.vstgm.co.in/api/v2/status.json");

var extract = Catchpoint.extract("resp-content", "([\\s\\S]*)");
var json_content = JSON.parse(extract.trim());

var cloudflarestatus = json_content.status.indicator;
var description = json_content.status.description;
var url = json_content.page.url;
var timezone = json_content.page.time_zone;

var rawtime = json_content.page.updated_at;
var time = "";
if (rawtime) {
    time = rawtime.substring(0, 19).replace("T", " ");
}

setTracepoint("cf_status", cloudflarestatus);

storeGlobalVariable(description, "cf_status_description");
storeGlobalVariable(url, "cf_status_url");
storeGlobalVariable(time, "cf_status_time");
storeGlobalVariable(timezone, "cf_status_timezone");
storeGlobalVariable(cloudflarestatus, "cf_status_cloudflarestatus");

setStepName("VSTGM Incidents Tracking");
open("https://www.vstgm.co.in/api/v2/incidents/unresolved.json");

var extract1 = Catchpoint.extract("resp-content", "([\\s\\S]*)");
var json_content1 = JSON.parse(extract1.trim());

var incidents = json_content1.incidents || [];
incidents.sort(function (a, b) {
    return new Date(b.updated_at || b.started_at || 0) - new Date(a.updated_at || a.started_at || 0);
});

var context_value1 = incidents.length;
var incident_count = String(context_value1);

setIndicator("cf_incident_count", context_value1);

if (context_value1 > 0) {
    var latestIncident = incidents[0];
    var updates = latestIncident.incident_updates || [];
    updates.sort(function (a, b) {
        return new Date(b.updated_at || b.display_at || b.created_at || 0) - new Date(a.updated_at || a.display_at || a.created_at || 0);
    });
    var latestUpdate = updates[0] || {};
    var affectedComponent = (latestUpdate.affected_components || [])[0] || {};

    var inc_name = latestIncident.name || "N/A";
    var inc_status = latestIncident.status || "N/A";
    var inc_impact = latestIncident.impact || "N/A";
    var inc_raw_time = latestIncident.started_at;
    var inc_start_time = "";
    if (inc_raw_time) {
        inc_start_time = inc_raw_time.substring(0, 19).replace("T", " ");
    }
    var inc_com_name = affectedComponent.name || "N/A";
    var inc_com_desc = latestUpdate.body || "N/A";
    var inc_com_status = affectedComponent.new_status || "N/A";
} else {
    var inc_name = "No active incidents";
    var inc_status = "N/A";
    var inc_impact = "None";
    var inc_start_time = "N/A";
    var inc_com_name = "N/A";
    var inc_com_desc = "N/A";
    var inc_com_status = "N/A";
}

storeGlobalVariable(inc_name, "cf_inc_name");
storeGlobalVariable(inc_status, "cf_inc_status");
storeGlobalVariable(inc_impact, "cf_inc_impact");
storeGlobalVariable(inc_start_time, "cf_inc_start_time");
storeGlobalVariable(inc_com_name, "cf_inc_com_name");
storeGlobalVariable(inc_com_desc, "cf_inc_com_desc");
storeGlobalVariable(inc_com_status, "cf_inc_com_status");
storeGlobalVariable(incident_count, "cf_inc_count");
