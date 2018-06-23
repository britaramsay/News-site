// Get headlines clicked
$("#headlines").on("click", function (){
    $.get('/headlines').then(function(data) {
        // Empty and append headlines
        console.log(data)
        $('#data').html('<div class="alert alert-success" role="alert">'+
        '<strong>MOVIEWEB scraped!</strong> Click "All Movies".'
      +'</div>')
        // $("#data").empty()
        // $('#data').append(data)
    })
})

$('.comment-form').on('submit', function (e) {
    e.preventDefault()
    $.post('addComment/'+$(this).data('id'), {body: $("#body-"+$(this).data('id')).val()}, (data) => {
        getComments($(this).data('id'))
    })
})

function getComments(id) {  
    console.log(id)
    $.get('/getComments/'+id).then((data) => {  
        // Append comments
        console.log(data)
        var arr = String(data).split('</li>').length - 1
        $('#list-'+id).addClass('hideComments')
        $('#list-'+id).removeClass('getComments')
        $('#list-'+id).html('Hide Comments <i class="fas fa-angle-up">')
        $('#list-'+id).data('comments', arr)
        $('#comments-'+id).show()
        $('#comments-'+id).empty()
        $('#comments-'+id).append(data)
    })
}
// View all comments on a movie clicked
$(document).on('click', ".getComments", function () {  
    // Get comments on this movie
   getComments($(this).attr('id').substring(5, $(this).attr('id').length))
})

$(document).on('click', '.hideComments', function () {  
    $('#comments-'+$(this).attr('id').substring(5, $(this).attr('id').length)).hide()
    $(this).addClass('getComments')
    $(this).removeClass('hideComments')
    $(this).html('(' + $(this).data('comments') + ') Comments <i class="fas fa-angle-down"></i>')
})

$(document).on('click', '.delete', function () {  
    console.log($(this).data('movie'))
    $.post('/deleteComment/' + $(this).attr('id'), (result) => {
            // Do something with the result
            getComments($(this).data('movie'))
        }
    );
    
})

$(document).on('click', '.bookmark', function () { 
    console.log('hiii') 
    $.post('/save/'+$(this).attr('id'), (result) => {
        $(this).removeClass('bookmark far')
        $(this).addClass('remove fas')
    })
})

$(document).on('click', '.remove', function () { 
    console.log('hiii') 
    $.post('/remove/'+$(this).attr('id'), (result) => {
        $(this).removeClass('remove fas')
        $(this).addClass('bookmark far')
    })
})
// $(document).on('click', '.saved', function() {
//     $.get('/saved')
// })