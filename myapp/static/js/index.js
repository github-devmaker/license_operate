$(document).ready(function(){
    setInterval(function(){
        // getCount();
    },1000)
});
function getCount(){
    $.get('/getItems',{},function(data){
        console.log(data)
        $('#count').html(data.message)
    });
}