function newEvent(name, notes, dateStart, dateEnd) {
  const now = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15);
  const dStart = new Date(dateStart)
    .toISOString()
    .replace(/[-:.]/g, "")
    .slice(0, 15);
  const dEnd = new Date(dateEnd)
    .toISOString()
    .replace(/[-:.]/g, "")
    .slice(0, 15);
  let event = `BEGIN:VEVENT\nDTSTAMP:${now}Z\nDTSTART:${dStart}Z\nDTEND:${dEnd}Z\nSUMMARY:${name}\nDESCRIPTION:${notes}\nEND:VEVENT`;
  return event;
}

/*console.log(
  newEvent(
    "test",
    "this is a test",
    "2024-06-29T00:00:00.000+07:00",
    "2024-06-29T00:00:00.000+07:00"
  )
);*/

module.exports = newEvent;
