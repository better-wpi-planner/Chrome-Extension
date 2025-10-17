/* eslint-disable no-undef */
const addProfessorPopup = (professorName, profData) => {
  professorName.addEventListener("mouseover", (e) => {
    const target = e.target;
    // Create a div for the popup container
    let popup = document.createElement("div");
    popup.className = "hover-popup"; // Optional: Keep the class name if you prefer, but not needed for styles

    // Inject the HTML content directly into the popup
    popup.innerHTML = `
      <div class="popup-content">
        <h4>Professor: ${profData.profName}</h4>
        <p><strong>Department:</strong> ${profData.department}</p>
        <p><strong>Rating:</strong> ${profData.rating} / 5.0</p>
        <p><strong>Ratings Count:</strong> ${profData.ratingCount}</p>
        <p><strong>Would Take Again:</strong> ${profData.wouldTakeAgain}%</p>
        <p><strong>Level of Difficulty:</strong> ${profData.difficulty}</p>
      </div>
    `;

    // Apply styles directly to the popup
    popup.style.position = "absolute";
    popup.style.backgroundColor = "white";
    popup.style.border = "1px solid #ccc";
    popup.style.padding = "15px";
    popup.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
    popup.style.fontFamily = "Arial, sans-serif";
    popup.style.fontSize = "14px";

    // Apply styles to specific elements inside the popup
    const link = popup.querySelector("a");
    if (link) {
      link.style.color = "blue";
      link.style.textDecoration = "underline";
    }

    const heading = popup.querySelector("h4");
    if (heading) {
      heading.style.margin = "0 0 10px 0";
    }

    // Append the popup container to the body
    document.body.appendChild(popup);

    // Position the popup near the professor name
    const rect = target.getBoundingClientRect();
    popup.style.top = rect.top + window.scrollY + rect.height + 10 + "px";
    popup.style.left = rect.left + window.scrollX + "px";

    // Remove the popup when the mouse leaves the element
    target.addEventListener("mouseout", () => {
      popup.remove(); // Remove the popup from the DOM
    });
  });
};

var body = document.getElementsByTagName("body")[0];
var hasObserved = false;

const observer = new MutationObserver((mutations) => {
  console.log("Mutation detected" + mutations);
  const topScheduleButton = document.getElementsByClassName(
    "sched-TopButtonEnabled"
  )[3];
  if (!hasObserved) {
    const topCoursesButton = document.getElementsByClassName(
      "sched-TopButtonEnabled"
    )[0];
    setupFilterButtons();
    topCoursesButton.addEventListener("click", () => {
      filter(0);
    });
    hasObserved = true;
  }
  if (topScheduleButton && !topScheduleButton.dataset.listenerAttached) {
    topScheduleButton.dataset.listenerAttached = "true";

    topScheduleButton.addEventListener("click", () => {
      const courseItems = document.getElementsByClassName(
        "permutationCourseItem"
      );
      [...courseItems].forEach((courseItem) => {
        // get the button element
        const thisButton = courseItem.getElementsByTagName("button")[0];
        if (thisButton.innerText === "▼") {
          thisButton.click();
        }
        // Find the course name
        thisButton.addEventListener("click", () => {
          if (thisButton.innerText == "▼") {
            // get all element of professor names
            const professorNames =
              courseItem.getElementsByClassName("PeriodSelectProf");
            [...professorNames].forEach((professorName) => {
              const profNameStr = removeParenthesesAtEnd(
                professorName.innerText
              );

              const onReceivedProfessorData = (professorData) => {
                const sectionNameCheckbox =
                  professorName.parentElement.getElementsByClassName(
                    "gwt-CheckBox"
                  )[0];
                const sectionName =
                  sectionNameCheckbox.getElementsByTagName("label")[0];
                const sectionNameStr = removeParenthesesAtEnd(
                  sectionName.innerText
                );
                if (professorData && !sectionName.innerText.includes("(")) {
                  sectionName.innerHTML =
                    sectionNameStr + " (" + professorData.rating + "★)";
                  addProfessorPopup(professorName, professorData);
                } else if (
                  professorData &&
                  sectionName.innerText.includes("N/A")
                ) {
                  sectionName.innerHTML =
                    sectionNameStr + " (" + professorData.rating + "★)";
                  addProfessorPopup(professorName, professorData);
                } else if (!sectionName.innerText.includes("(")) {
                  sectionName.innerHTML = sectionNameStr + "(N/A)";
                }
              };
              // get data from service worker
              (async () => {
                const profData = await chrome.runtime.sendMessage({
                  text: "getProfessorData",
                  professorName: profNameStr,
                });
                onReceivedProfessorData(profData);
              })();
            });
          }
        });
      });
    });
  }
});

observer.observe(body, {
  childList: true,
});

// Because the name we get will be appended with rating, and this is the easiest way to do it.
function removeParenthesesAtEnd(str) {
  return str.replace(/\s*\(.*\)$/, "");
}

function filter(num) {
  courseList = document.getElementsByClassName("courseList")[1].children;
  if (num == 4) {
    for (var i = 0; i < courseList.length; i++) {
      courseList[i].style.display = "";
    }
  }

  for (var i = 0; i < courseList.length; i++) {
    var child = courseList[i];
    const x = child.children[2].children[0].children;
    const y = x[num].getAttribute("title");

    if (y[0] == "C") {
      console.log(y[0]);
      child.style.display = "none";
    }
  }
}

function setupFilterButtons() {
  const targetElement = document.getElementsByClassName("GOWDEH0CJI")[1];

  targetElement.innerHTML = " ";
  targetElement.parentElement.style.overflow = "visible";
  targetElement.parentElement.parentElement.children[3].style.inset =
    "0px 0px 0px 530px";
  const textLabel = document.createElement("span");
  textLabel.textContent = "Filter Term";
  textLabel.style.marginLeft = "15px";
  textLabel.style.fontSize = "16px";
  textLabel.style.whiteSpace = "nowrap";
  textLabel.style.color = "white";
  targetElement.appendChild(textLabel);

  targetElement.style.paddingTop = "3px";
  targetElement.style.display = "flex";
  targetElement.style.alignItems = "center";

  const buttonLabels = ["A", "B", "C", "D", "Reset"];
  const buttons = [];

  const defaultStyle = {
    backgroundColor: "#f0f0f0",
    color: "black",
  };

  const selectedStyle = {
    backgroundColor: "#c41230",
    color: "white",
  };

  buttonLabels.forEach((label, index) => {
    const button = document.createElement("button");
    button.textContent = label;

    button.style.margin = "0 3px";
    button.style.padding = "3px 12px";
    button.style.border = "2px solid #ccc";
    button.style.borderRadius = "20px";
    button.style.cursor = "pointer";
    Object.assign(button.style, defaultStyle);

    button.addEventListener("click", () => {
      if (label === "Reset") {
        buttons.forEach((btn) => {
          if (btn.textContent !== "Reset") {
            Object.assign(btn.style, defaultStyle);
          }
        });
      } else {
        const isSelected =
          button.style.backgroundColor === selectedStyle.backgroundColor;
        Object.assign(button.style, isSelected ? defaultStyle : selectedStyle);
      }
      filter(index);
    });

    targetElement.appendChild(button);
    buttons.push(button);
  });
}
