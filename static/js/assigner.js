var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { postDataAdmin, postDataGeneral } from "./global.js";
const scheduleTableCells = $("#schedule tbody .time-slots");
const initialTableDOM = $("#schedule")[0];
let startCell;
let endCell;
let currentStatusSetting = "break";
let rightClickStart = false;
$(window).on('keypress', function (e) {
    if (e.key != "s")
        return;
    $("#status-update").html("Set to: " + currentStatusSetting);
    flipCurrentStatus();
});
export function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const schedule = {};
        const scoutingBlocks = (yield postDataGeneral({ action: "getBlocks" })).blocks;
        for (let i = 1; i < initialTableDOM.rows.length; i++) {
            const id = initialTableDOM.rows[i].cells[1].textContent;
            if (!id)
                continue;
            schedule[id] = {
                assignments: Array.from({ length: initialTableDOM.rows[0].cells.length - 2 }, (_, a) => {
                    return {
                        time: scoutingBlocks[a],
                        status: $(initialTableDOM.rows[i].cells[a + 2]).data("deployedStatus") // Gets "data-deployed-status" property of cell
                    };
                }),
                alliance: $(initialTableDOM.rows[i].cells[0]).data("alliance") // Gets "data-alliance" property of cell
            };
        }
        scheduleTableCells.on('mousedown', function (e) {
            console.log(e.which);
            if (e.which == 3)
                rightClickStart = true;
            e.preventDefault();
            startCell = [this.cellIndex, this.parentElement.rowIndex];
        });
        scheduleTableCells.on('mouseover', function () {
            $(this).toggleClass("selected");
        });
        scheduleTableCells.on('contextmenu', (e) => e.preventDefault());
        scheduleTableCells.on('mouseup', function () {
            endCell = [this.cellIndex, this.parentElement.rowIndex];
            console.log(rightClickStart);
            if (rightClickStart)
                flipCurrentStatus();
            create2DTable([startCell, endCell]).forEach((cell) => {
                const currentCell = getCellByIndex(cell);
                const id = currentCell.parentElement.cells[1].textContent;
                if (!id)
                    return;
                const assignmentIndex = schedule[id].assignments.findIndex((a) => a.time == scoutingBlocks[cell[0] - 2]);
                schedule[id].assignments[assignmentIndex].status = currentStatusSetting;
                currentCell.style.backgroundColor = currentStatusSetting == "break" ? "white" : "lightblue";
            });
            if (rightClickStart)
                flipCurrentStatus();
            rightClickStart = false;
            console.log(rightClickStart);
        });
        $("#deploy").on('click', function () {
            $("#deploy").attr("disabled", "disabled");
            postDataAdmin({
                action: "deploySchedule",
                schedule
            }).then(() => window.location.reload());
        });
        $("#status-update").on('click', function () {
            $("#status-update").html("Set to: " + currentStatusSetting);
            flipCurrentStatus();
        });
        $(".schedule-username").on('click', function () {
            const id = this.parentElement.cells[1].textContent;
            if (!id)
                return;
            schedule[id].alliance = schedule[id].alliance == "red" ? "blue" : "red";
            this.style.color = schedule[id].alliance;
        });
    });
}
function create2DTable(bounds) {
    let [[x1, y1], [x2, y2]] = bounds;
    if (x1 > x2) {
        x2 = [x1, x1 = x2][0];
    }
    if (y1 > y2) {
        y2 = [y1, y1 = y2][0];
    }
    let table = [];
    for (let a = x1; a <= x2; a++) {
        for (let b = y1; b <= y2; b++) {
            table.push([a, b]);
        }
    }
    return table;
}
function getCellByIndex(cell) {
    const rowIndex = cell[1], colIndex = cell[0];
    const tableDOM = $("#schedule")[0];
    return tableDOM.rows[rowIndex].cells[colIndex];
}
function flipCurrentStatus() {
    currentStatusSetting = currentStatusSetting == "break" ? "scouting" : "break";
}
