const upcomingName = document.querySelector("#upcoming-name");
const upcomingDate = document.querySelector("#upcoming-date");
const verseText = document.querySelector("#verse-text");
const verseRef = document.querySelector("#verse-ref");
const scheduleList = document.querySelector("#schedule");

function rowTemplate(meeting) {
  const classes = ["row"];
  if (meeting.isThisWeek) classes.push("this-week");
  if (meeting.isPast) classes.push("past");

  const hint = meeting.isThisWeek
    ? "Leads this Thursday"
    : meeting.generated
      ? "Continues the rotation"
      : "";

  return `
    <li class="${classes.join(" ")}">
      <time datetime="${meeting.isoDate}">${meeting.dateLabelEn}</time>
      <div>
        <span class="name">${meeting.name}</span>
        ${hint ? `<div class="hint">${hint}</div>` : ""}
      </div>
    </li>
  `;
}

try {
  const response = await fetch("/api/schedule");
  if (!response.ok) {
    throw new Error("Could not load the prayer schedule.");
  }

  const data = await response.json();
  upcomingName.textContent = data.upcoming.name;
  upcomingDate.textContent = `${data.upcoming.dateLabelEn} at 5:00 AM`;
  verseText.textContent = `“${data.verse.text}”`;
  verseRef.textContent = data.verse.reference;
  scheduleList.innerHTML = data.meetings.map(rowTemplate).join("");
} catch (error) {
  upcomingName.textContent = "Schedule unavailable";
  upcomingDate.textContent = error.message;
}
