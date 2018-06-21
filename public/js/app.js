$("#headlines").on("click", function (){
    $.get('/headlines').then(function(data) {
        $("#data").empty()
        $('#data').append(data)
    })
})

$(document).on('click', ".comment", function () {  
    $("#form-"+$(this).data("id")).show()
    console.log($(this).data("id"))
})