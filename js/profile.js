$(() => {
    $(".side-button").on("click", function() {
        let id = $(this).attr("id").split("-")[1];
        $(".screen-info").addClass("d-none");
        $(`#screen-${id}`).removeClass("d-none");
        $(".side-button").children().removeClass("text-info");
        $(this).children().addClass("text-info");
    });
});