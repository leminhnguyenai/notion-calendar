function renderJSON(jsonObj) {
  return new Promise((resolve, reject) => {
    try {
      let calendarData = `BEGIN:VCALENDAR\nVERSION:2.0\nPROID:GREGORIAN\nMETHOD:PUBLISH\n\n`;
      for (let i = 0; i <= jsonObj.length - 1; i++) {
        let uid = jsonObj[i].uid;
        let dtstamp = jsonObj[i].dtstamp.replace(/[-:.]/g, "").slice(0, 15);
        let dtstart = new Date(jsonObj[i].dtstart)
          .toISOString()
          .replace(/[-:.]/g, "")
          .slice(0, 15);
        let dtend = new Date(jsonObj[i].dtend)
          .toISOString()
          .replace(/[-:.]/g, "")
          .slice(0, 15);
        let summary = jsonObj[i].summary;
        let description = jsonObj[i].description;
        calendarData += `BEGIN:VEVENT\nUID:${uid}\nDTSTAMP:${dtstamp}Z\nDTSTART:${dtstart}Z\nDTEND:${dtend}Z\nSUMMARY:${summary}\nDESCRIPTION:${description}\nEND:VEVENT\n\n`;
      }
      calendarData += `END:VCALENDAR`;
      resolve(calendarData);
    } catch (err) {
      console.log("Error");
      reject(err);
    }
  });
}

function mergeCalendar(jsonCal1, jsonCal2) {
  if (jsonCal2.length < 100) return jsonCal2;
  else {
    let connected = false;
    let i = 0;
    let index = (location) => {
      return jsonCal1.map((event) => event.uid).indexOf(jsonCal2[location].uid);
    };
    let mergedCal;
    while (connected == false && i <= jsonCal2.length - 1) {
      if (index(i) != -1) connected = true;
      else i++;
    }
    if (connected == true) {
      mergedCal = jsonCal1.slice(0, index(i));
      jsonCal2.forEach((event) => {
        mergedCal.push(event);
      });
    } else {
      mergedCal = jsonCal1;
      jsonCal2.forEach((event) => {
        mergedCal.push(event);
      });
    }
    return mergedCal;
  }
}

module.exports = { renderJSON, mergeCalendar };
