// Get headlines clicked
$("#headlines").on("click", function (){
    $.get('/headlines').then(function(data) {
        // Empty and append headlines
        console.log(data)
        $("#data").empty()
        $('#data').append(data)
    })
})

$('.comment-form').on('submit', function (e) {
    e.preventDefault()
    console.log($("#body-"+$(this).data('id')).val())
    $.post('addComment/'+$(this).data('id'), {body: $("#body-"+$(this).data('id')).val()}, (data) => {
        // $.get('/getComments/'+$(this).data('id')).then((data) => {$(this).addClass('hideComments')
        //     $(this).removeClass('getComments')
        //     $(this).text('Hide Comments')
        //     $(this).text('Hide Comments')            
        //     $('#comments-'+$(this).data('id')).show()
        //     $('#comments-'+$(this).attr('id')).empty()
        //     $('#comments-'+$(this).data('id')).append(data) 
        // })
       getComments($(this).data('id'), $(this))
        
    })
})

function getComments(id, tthis) {  
    $.get('/getComments/'+id).then((data) => {  
        // Append comments
        var arr = String(data).split('</li>').length - 1
        console.log(arr)
        $('#list-'+id).addClass('hideComments')
        $('#list-'+id).removeClass('getComments')
        $('#list-'+id).text('Hide Comments')
        $('#list-'+id).data('comments', arr)
        $('#comments-'+id).show()
        $('#comments-'+id).empty()
        $('#comments-'+id).append(data)
    })
}
// View all comments on a movie clicked
$(document).on('click', ".getComments", function () {  
    // Get comments on this movie
   getComments($(this).attr('id').substring(5, $(this).attr('id').length), $(this))
})

$(document).on('click', '.hideComments', function () {  
    $('#comments-'+$(this).attr('id').substring(5, $(this).attr('id').length)).hide()
    $(this).addClass('getComments')
    $(this).removeClass('hideComments')
    $(this).text('Show (' + $(this).data('comments') + ') Comments')
})