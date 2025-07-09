document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // Participant list (no bullets)
        const participantList = document.createElement("ul");
        participantList.style.listStyle = "none";
        participantList.style.paddingLeft = "0";
        details.participants.forEach((participant) => {
          const li = document.createElement("li");
          li.style.display = "flex";
          li.style.alignItems = "center";
          li.style.marginBottom = "2px";
          li.textContent = participant;

          // Delete icon
          const deleteBtn = document.createElement("span");
          deleteBtn.textContent = "🗑️";
          deleteBtn.title = "Remove participant";
          deleteBtn.style.cursor = "pointer";
          deleteBtn.style.marginLeft = "8px";
          deleteBtn.addEventListener("click", async () => {
            if (!confirm(`Remove ${participant} from ${name}?`)) return;
            try {
              const resp = await fetch(
                `/activities/${encodeURIComponent(name)}/signup?email=${encodeURIComponent(participant)}`,
                { method: "DELETE" }
              );
              if (resp.ok) {
                fetchActivities();
              } else {
                alert("Failed to remove participant.");
              }
            } catch (err) {
              alert("Error removing participant.");
            }
          });

          li.appendChild(deleteBtn);
          participantList.appendChild(li);
        });

        // Add participant list to card
        if (details.participants.length > 0) {
          const partHeader = document.createElement("p");
          partHeader.style.marginBottom = "4px";
          partHeader.innerHTML = "<strong>Participants:</strong>";
          activityCard.appendChild(partHeader);
          activityCard.appendChild(participantList);
        }

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh activities list after successful signup
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
