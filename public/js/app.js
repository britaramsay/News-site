$("#headlines").on("click", function (){
    $.get('/headlines').then(function(data) {
        $("#data").empty()
        $('#data').append(data)
    })
})