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

$(document).on('click', ".getComments", function () {  
    // console.log($(this).attr('id'))
    $.get('/getComments/'+$(this).attr('id')).then((data) => {  
        console.log($(this).attr('id'))
        $('#comments-'+$(this).attr('id')).append(data)
    })

})