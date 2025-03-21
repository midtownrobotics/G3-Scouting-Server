import { postDataAdmin } from "./global";
const URLParams = new URLSearchParams(window.location.search);
$(".trash").on("click", function () {
    const rowId = parseInt($(this).next().text().trim());
    const uSure = confirm(`Response ID ${rowId} will be deleted!`);
    if (uSure) {
        postDataAdmin({ action: "deleteRow", rowId });
        window.location.reload();
    }
});
