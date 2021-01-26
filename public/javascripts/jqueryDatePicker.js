var datefield=document.createElement("input")
datefield.setAttribute("type", "date")

if (datefield.type!="date"){ //if browser doesn't support input type="date", initialize date picker widget:
    jQuery(function($){ //on document.ready
        $('#dateApplied').datepicker();
    })
}