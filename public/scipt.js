document
    .getElementById("uploadForm")
    .addEventListener("submit", async function (e) {
        e.preventDefault();

        let fileInput = document.getElementById("csvFile");
        if (!fileInput.files.length) {
            alert("Please select a CSV file!");
            return;
        }
        // disabling submit btn
        document.getElementById("submitBtn").disabled = true;

        let formData = new FormData();
        formData.append("csvFile", fileInput.files[0]);

        try {
            let response = await fetch("/upload", {
                method: "POST",
                body: formData,
            });

            let jsonData = await response.json();
            document.getElementById("jsonOutput").textContent = JSON.stringify(
                jsonData,
                null,
                2
            );

            // copy button
            let copyButton = document.createElement("button");
            copyButton.textContent = "Copy JSON";
            copyButton.style.margin = "10px";
            copyButton.style.padding = "10px";
            copyButton.style.backgroundColor = "#4CAF50";
            copyButton.style.color = "white";
            copyButton.style.border = "none";
            copyButton.style.borderRadius = "5px";
            copyButton.style.cursor = "pointer";
            copyButton.addEventListener("click", function () {
                navigator.clipboard
                    .writeText(JSON.stringify(jsonData, null, 2))
                    .then(() => {
                        alert("JSON copied to clipboard!");
                    })
                    .catch((err) => {
                        console.error("Error copying JSON to clipboard:", err);
                    });
            });
            document.body.appendChild(copyButton);

            // download button
            let downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(
                new Blob([JSON.stringify(jsonData, null, 2)], {
                    type: "application/json",
                })
            );
            downloadLink.download = "data.json";
            downloadLink.textContent = "Download JSON";
            downloadLink.style.margin = "10px";
            downloadLink.style.padding = "10px";
            downloadLink.style.backgroundColor = "#008CBA";
            downloadLink.style.color = "white";
            downloadLink.style.textDecoration = "none";
            downloadLink.style.border = "none";
            downloadLink.style.borderRadius = "5px";
            downloadLink.style.cursor = "pointer";
            document.body.appendChild(downloadLink);
        } catch (error) {
            console.error("Error:", error);
        }
    });
