window.onload = function(){
    $('#mainNav').removeClass('invisible');
    $('#carga').fadeOut();
    $('body').removeClass('hidden')
    
    if (screen.width <= 1383) {
        $('#iframepc').hide();
    }
    else {
        $('#iframem').hide();
    }
    
}

//if the screen width is equal to 1383 then print yes
if (screen.width == 1383) {
    console.log("yes");
}
else {
    console.log("no");
}