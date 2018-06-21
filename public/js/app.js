// Get headlines clicked
$("#headlines").on("click", function (){
    $.get('/headlines').then(function(data) {
        // Empty and append headlines
        console.log(data)
        $("#data").empty()
        $('#data').append(data)
    })
})

// Leave comment clicked
$(document).on('click', ".comment", function () {  
    console.log('heda')
    
    // Show comment form
    $("#form-"+$(this).data("id")).show()
})

// View all comments on a movie clicked
$(document).on('click', ".getComments", function () {  
    // Get comments on this movie
    $.get('/getComments/'+$(this).attr('id')).then((data) => {  
        // Append comments
        $('#comments-'+$(this).attr('id')).append(data)
    })
})