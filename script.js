document.addEventListener("DOMContentLoaded", () => {
    const algorithmSelector = document.getElementById("algorithm");
    const processTableBody = document.getElementById("process-table").querySelector("tbody");
    const ganttChart = document.getElementById("gantt-chart");
    const results = document.getElementById("results");
    let processId = 1;

    // Add process to table
    document.getElementById("add-process").addEventListener("click", () => {
        const row = processTableBody.insertRow();
        row.innerHTML = `
            <td>P${processId++}</td>
            <td><input type="number" min="0" class="arrival-time" placeholder="0"></td>
            <td><input type="number" min="1" class="burst-time" placeholder="1"></td>
            <td><input type="number" min="1" class="priority" placeholder="1"></td>
            <td><button class="delete-row">Delete</button></td>
        `;

        // Add delete functionality
        row.querySelector(".delete-row").addEventListener("click", () => {
            row.remove();
        });
    });

    // Simulate scheduling
    document.getElementById("simulate").addEventListener("click", () => {
        const processes = [];
        const rows = processTableBody.querySelectorAll("tr");

        rows.forEach((row, index) => {
            const arrivalTime = parseInt(row.querySelector(".arrival-time").value || "0");
            const burstTime = parseInt(row.querySelector(".burst-time").value || "1");
            const priority = parseInt(row.querySelector(".priority").value || "1");

            processes.push({ id: `P${index + 1}`, arrivalTime, burstTime, priority, remainingTime: burstTime });
        });

        const selectedAlgorithm = algorithmSelector.value;
        const simulationResult = simulate(processes, selectedAlgorithm); // Pass the correct algorithm value
        displayGanttChart(simulationResult.ganttChart);
        displayResults(simulationResult.tat, simulationResult.awt);
    });

    function simulate(processes, algorithm) {
        let currentTime = 0;
        let ganttChart = [];
        let completedProcesses = [];
        let tat = 0; // Total Turnaround Time
        let awt = 0; // Average Waiting Time

        if (algorithm === "sjf-preemptive") {
            // Shortest Job First (Preemptive)
            processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
            while (processes.length > 0) {
                const available = processes.filter(p => p.arrivalTime <= currentTime);
                if (available.length > 0) {
                    available.sort((a, b) => a.remainingTime - b.remainingTime);
                    const current = available[0];
                    ganttChart.push(current.id);
                    current.remainingTime--;
                    currentTime++;
                    if (current.remainingTime === 0) {
                        processes = processes.filter(p => p.id !== current.id);
                        current.completionTime = currentTime;
                        completedProcesses.push(current);
                    }
                } else {
                    ganttChart.push("Idle");
                    currentTime++;
                }
            }
        } else if (algorithm === "sjf-non-preemptive") {
            processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
            while (processes.length > 0) {
                const available = processes.filter(p => p.arrivalTime <= currentTime);
                if (available.length > 0) {
                    available.sort((a, b) => a.burstTime - b.burstTime);
                    const current = available[0];
                    ganttChart.push(...Array(current.burstTime).fill(current.id));
                    currentTime += current.burstTime;
                    processes = processes.filter(p => p.id !== current.id);
                    current.completionTime = currentTime;
                    completedProcesses.push(current);
                } else {
                    ganttChart.push("Idle");
                    currentTime++;
                }
            }
        } else if (algorithm === "priority-preemptive") {
            processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
            while (processes.length > 0) {
                const available = processes.filter(p => p.arrivalTime <= currentTime);
                if (available.length > 0) {
                    available.sort((a, b) => a.priority - b.priority);
                    const current = available[0];
                    ganttChart.push(current.id);
                    current.remainingTime--;
                    currentTime++;
                    if (current.remainingTime === 0) {
                        processes = processes.filter(p => p.id !== current.id);
                        current.completionTime = currentTime;
                        completedProcesses.push(current);
                    }
                } else {
                    ganttChart.push("Idle");
                    currentTime++;
                }
            }
        } else if (algorithm === "priority-non-preemptive") {
            processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
            while (processes.length > 0) {
                const available = processes.filter(p => p.arrivalTime <= currentTime);
                if (available.length > 0) {
                    available.sort((a, b) => a.priority - b.priority);
                    const current = available[0];
                    ganttChart.push(...Array(current.burstTime).fill(current.id));
                    currentTime += current.burstTime;
                    processes = processes.filter(p => p.id !== current.id);
                    current.completionTime = currentTime;
                    completedProcesses.push(current);
                } else {
                    ganttChart.push("Idle");
                    currentTime++;
                }
            }
        }

        completedProcesses.forEach(p => {
            p.turnaroundTime = p.completionTime - p.arrivalTime;
            p.waitingTime = p.turnaroundTime - p.burstTime;
            tat += p.turnaroundTime;
            awt += p.waitingTime;
        });

        awt /= completedProcesses.length;

        return { ganttChart, tat, awt };
    }

    function displayGanttChart(chart) {
        ganttChart.innerHTML = "";
        chart.forEach(block => {
            const div = document.createElement("div");
            div.className = "gantt-block";
            div.textContent = block;
            ganttChart.appendChild(div);
        });
    }

    function displayResults(tat, awt) {
        results.innerHTML = `
            <p>Total Turnaround Time (TAT): ${tat}</p>
            <p>Average Waiting Time (AWT): ${awt}</p>
        `;
    }
});
