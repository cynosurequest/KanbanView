import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getTimeSheetRecords from '@salesforce/apex/EmployeeTimesheet.getTimeSheetRecords'
import insertTimeSheet from '@salesforce/apex/EmployeeTimesheet.insertTimeSheet'
import getLeaveRequestRecord from '@salesforce/apex/EmployeeTimesheet.getLeaveRequestRecord'
import { refreshApex } from '@salesforce/apex';

export default class Timesheetcal extends LightningElement {
    day;
    selectedTabValue;
    activeMonth = ''
    @track activeMonthDays = []
    currentDate
    startTime ;
    morningBreakStart
    morningBreakEnd
    lunchStart;
    lunchEnd;
    eveningBreakStart
    eveningBreakEnd
    endTime;
    overTimeHours = 0;
    totalWorkHours
    //data = []
    monthData = [];
    months = []
    @track timeSheetRecordsResult;

    months = [
        { label: 'January', days: [] },
        { label: 'February', days: [] },
        { label: 'March', days: [] },
        { label: 'April', days: [] },
        { label: 'May', days: [] },
        { label: 'June', days: [] },
        { label: 'July', days: [] },
        { label: 'August', days: [] },
        { label: 'September', days: [] },
        { label: 'October', days: [] },
        { label: 'November', days: [] },
        { label: 'December', days: [] }
    ];
    activeMonth = this.months[0];

    connectedCallback() {
        this.months.forEach(month => {
            let numDays = new Date(2023, monthIndex(month.label), 0).getDate();
            for (let i = 1; i <= numDays; i++) {
                let day = {}
                day = {
                    date: i + '/' + monthIndex(month.label) + '/' + 2023,
                    startTime: '',
                    morningBreakStart: '',
                    morningBreakEnd: '',
                    lunchStart: '',
                    lunchEnd: '',
                    eveningBreakStart: '',
                    eveningBreakEnd: '',
                    endTime: '',
                    overTimeHours: 0,
                    totalWorkHours: '',
                    disabled : false,
                    startMin : "",
                    MBreakStartMin: "",
                    MBreakEndMin: "",
                    lunchStartMin : "",
                    lunchEndMin : "",
                    EBreakStartMin: "",
                    EBreakEndMin: "",
                    endMin : ""
                };
                const today = new Date() 
                today.setDate(today.getDate() - 1);
                const dateOnly = today.toISOString().split('T')[0];

                var dateParts = day.date.split("/");
                var year = dateParts[2];
                var month1 = dateParts[1].padStart(2, "0");
                var days = dateParts[0].padStart(2, "0");
                var formattedDate = year + "-" + month1 + "-" + days;


                if(formattedDate < dateOnly){
                    day.disabled = true;
                }

                month.days.push(day);
            }
        });
    }

    handleInputChange(event) {
        this.day.totalWorkHours = event.target.value;
    }


    handleSave() {
        
        console.log(this.currentDate)
        console.log(this.startTime)
        console.log(this.lunchStart)
        console.log(this.lunchEnd)
        console.log(this.endTime)
        console.log(this.overTimeHours)
        getLeaveRequestRecord({currentDate: this.currentDate})
        .then(result =>{
            console.log('result'+ result)
            if (result ===  true){
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error!!',
                message: 'You have a Leave Request in this date',
                variant: 'error'
            })); 

            return refreshApex(this.activeMonthDays);    
        } else {

        insertTimeSheet({ activeMonth: this.selectedTabValue, currentDate: this.currentDate, startTime: this.startTime, morningBreakStart: this.morningBreakStart, morningBreakEnd: this.morningBreakEnd, lunchStart: this.lunchStart, lunchEnd: this.lunchEnd, endTime: this.endTime, eveningBreakStart: this.eveningBreakStart, eveningBreakEnd: this.eveningBreakEnd, overTimeHours: this.overTimeHours })
        .then(result => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success!!',
                message: 'Saved Successfully',
                variant: 'success'  
            }));  
            //console.log('activeMonthDays' + JSON.stringify(this.activeMonthDays))
            this.handleCallApex(this.selectedTabValue)
            return refreshApex(this.activeMonthDays);
        })
        .catch(error => {
            // Handle error response
            console.log(JSon.stringify(error));
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error!!',
                message: 'Some error occured.Please contact your administrator.',
                variant: 'error'
            }));
        })
    
    }
    }
    );
    }
    handleClear(event){
        const tempArray = [...this.months]
            tempArray.forEach(month => {

                if(month.label == this.selectedTabValue) {
                    month.days.forEach(day =>{
                        
                        if (day.date == event.target.getAttribute('data-day')){
                            day.startTime = null
                            day.morningBreakStart = null
                            day.morningBreakEnd = null
                            day.lunchEnd = null
                            day.lunchStart = null
                            day.eveningBreakStart = null
                            day.eveningBreakEnd = null
                            day.endTime= null
                            
                            console.log('Clear')
                            this.startTime = null
                            this.morningBreakStart = null
                            this.morningBreakEnd = null
                            this.lunchStart = null
                            this.lunchEnd = null
                            this.eveningBreakStart = null
                            this.eveningBreakEnd = null
                            this.endTime = null
                        }
                        
                    })
                }
            })
            this.months = [...tempArray]
            
    }
    
    handleTabActive(event) {
        var tempArray = []
        let activeLabel = event.target.label;
        this.activeMonth = this.months.find(month => month.label === activeLabel);
        this.selectedTabValue = activeLabel;
        console.log('this.selectedTabValue : ' + this.selectedTabValue)

        this.activeMonthDays = this.activeMonth.days;
        this.handleCallApex(this.selectedTabValue)
    }

    startRestrictTime(date, time){
        const tempArray = [...this.months]
            tempArray.forEach(month => {

                if(month.label == this.selectedTabValue) {
                    month.days.forEach(day =>{
                        if (day.date == date){
                            day.startMin = time
                        }
                        
                    })
                }
                //console.log('month '+ JSON.stringify(month));
            })
            this.months = [...tempArray]
            
    }

    MBreakSRestrictTime(date, time){
        const tempArray = [...this.months]
            tempArray.forEach(month => {

                if(month.label == this.selectedTabValue) {
                    month.days.forEach(day =>{
                        if (day.date == date){
                            day.MBreakStartMin = time
                        }
                        
                    })
                }
                //console.log('month '+ JSON.stringify(month));
            })
            this.months = [...tempArray]
            
    }

    MBreakERestrictTime(date, time){
        const tempArray = [...this.months]
            tempArray.forEach(month => {

                if(month.label == this.selectedTabValue) {
                    month.days.forEach(day =>{
                        if (day.date == date){
                            day.MBreakEndMin = time
                        }
                        
                    })
                }
                //console.log('month '+ JSON.stringify(month));
            })
            this.months = [...tempArray]
            
    }

    lunchStartRestrictTime(date, time){
        const tempArray = [...this.months]
            tempArray.forEach(month => {

                if(month.label == this.selectedTabValue) {
                    month.days.forEach(day =>{
                        if (day.date == date){
                            day.lunchStartMin = time
                        }
                        
                    })
                }
            })
            this.months = [...tempArray]
            
    }

    lunchEndRestrictTime(date, time){
        const tempArray = [...this.months]
            tempArray.forEach(month => {

                if(month.label == this.selectedTabValue) {
                    month.days.forEach(day =>{
                        if (day.date == date){
                            day.lunchEndMin = time
                        }
                        
                    })
                }
            })
            this.months = [...tempArray]
            
    }

    EBreakSRestrictTime(date, time){
        const tempArray = [...this.months]
            tempArray.forEach(month => {

                if(month.label == this.selectedTabValue) {
                    month.days.forEach(day =>{
                        if (day.date == date){
                            day.EBreakStartMin = time
                        }
                        
                    })
                }
                //console.log('month '+ JSON.stringify(month));
            })
            this.months = [...tempArray]
            
    }
    EBreakERestrictTime(date, time){
        const tempArray = [...this.months]
            tempArray.forEach(month => {

                if(month.label == this.selectedTabValue) {
                    month.days.forEach(day =>{
                        if (day.date == date){
                            day.EBreakEndMin = time
                        }
                        
                    })
                }
                //console.log('month '+ JSON.stringify(month));
            })
            this.months = [...tempArray]
            
    }
    
    endRestrictTime(date, time){
        const tempArray = [...this.months]
            tempArray.forEach(month => {

                if(month.label == this.selectedTabValue) {
                    month.days.forEach(day =>{
                        if (day.date == date){
                            day.endMin = time
                        }
                        
                    })
                }
            })
            this.months = [...tempArray]
            
    }

    handleChange(event) {
        var date = event.target.getAttribute('data-day') 
        if (event.target.name == "startTime") {
            this.startTime = event.target.value
            console.log('this.startTime' + this.startTime)
            //console.log("months" + this.months)
            this.startRestrictTime(date,this.startTime)   
        } else if (event.target.name == "morningBreakStart") {
            this.morningBreakStart = event.target.value 
            console.log('this.morningBreakStart' + this.morningBreakStart)
            this.MBreakSRestrictTime(date , this.morningBreakStart)
        } else if (event.target.name == "morningBreakEnd") {
            this.morningBreakEnd = event.target.value 
            console.log('this.morningBreakEnd' + this.morningBreakEnd)
            this.MBreakERestrictTime(date , this.morningBreakEnd)
        } else if (event.target.name == "lunchStart") {
            this.lunchStart = event.target.value
            console.log('this.lunchStart' + this.lunchStart)
            this.lunchStartRestrictTime(date , this.lunchStart)
        } else if (event.target.name == "lunchEnd") {
            this.lunchEnd = event.target.value
            console.log('this.lunchEnd' + this.lunchEnd)
            this.lunchEndRestrictTime(date, this.lunchEnd)
        } else if (event.target.name == "eveningBreakStart") {
            this.eveningBreakStart = event.target.value
            console.log('this.eveningBreakStart' + this.eveningBreakStart)
            this.EBreakSRestrictTime(date , this.eveningBreakStart)
        } else if (event.target.name == "eveningBreakEnd") {
            this.eveningBreakEnd = event.target.value
            console.log('this.eveningBreakEnd' + this.eveningBreakEnd)
            this.EBreakERestrictTime(date , this.eveningBreakEnd)    
        } else if (event.target.name == "endTime") {
            this.endTime = event.target.value
            console.log('this.endTime' + this.endTime)
            this.endRestrictTime(date, this.endTime)
        } else if (event.target.name == "overTimeHours") {
            this.overTimeHours = event.target.value
            console.log('this.overTimeHours' + this.overTimeHours)
        }

        this.day = event.target.getAttribute('data-day')
        this.currentDate = this.day
        console.log('day : ' + day)

    }

    

    handleCallApex(monthName) {
        getTimeSheetRecords({ month : monthName })
        .then(result => {
            console.log('result : ' + JSON.stringify(result))
            if(result != null){
                result.forEach(data => {
                    //console.log('Data : ' + JSON.stringify(data))
                    var formattedDate = convertDateFormat(data.Date__c)
                    var dateFormatNew = newFormatDate(formattedDate)
    
                    for(let i = 0; i<this.activeMonthDays.length; i++){
                        if(this.activeMonthDays[i].date === dateFormatNew){
                            this.activeMonthDays[i].startTime = formatTime(data.Start_Time__c)
                            this.activeMonthDays[i].morningBreakStart = formatTime(data.Morning_Break_Start__c)
                            this.activeMonthDays[i].morningBreakEnd = formatTime(data.Morning_Break_End__c)
                            this.activeMonthDays[i].lunchStart = formatTime(data.Lunch_Start__c)
                            this.activeMonthDays[i].lunchEnd = formatTime(data.Lunch_End__c)
                            this.activeMonthDays[i].eveningBreakStart = formatTime(data.Evening_Break_Start__c)
                            this.activeMonthDays[i].eveningBreakEnd = formatTime(data.Evening_Break_End__c)
                            this.activeMonthDays[i].endTime = formatTime(data.End_Time__c)
                            this.activeMonthDays[i].overTimeHours = data.Overtime_Hours__c
                            this.activeMonthDays[i].totalWorkHours = data.Total_Work_Hours__c
    
                            break
                        }
                        
                    }
     
                })
            }
            //console.log('this.activeMonthDays : ' + JSON.stringify(this.activeMonthDays))
        })
        .catch(error => {
            console.log('Error : ' + JSON.stringify(error))
        })
    }
}


function monthIndex(label) {
    // Return the 0-based index of the month with the given label
    return new Date(Date.parse(label + ' 1, 2023')).getMonth() + 1;
}

function convertDateFormat(dateString) {
    var parts = dateString.split('-'); // Split the date string by dashes
    var year = parts[0];
    var month = parts[1];
    var day = parts[2];
    var formattedDate = day + '/' + month + '/' + year; // Rearrange the elements
    return formattedDate;
}


function formatTime(milliseconds) {
    const seconds = Math.floor((milliseconds / 1000) % 60);
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
}


function newFormatDate(dateString) {
    var dateParts = dateString.split("/");
    // Parsing the date components
    var day = parseInt(dateParts[0], 10);
    var month = parseInt(dateParts[1], 10);
    var year = dateParts[2];
    // Creating a new date object with the parsed components
    var date = new Date(year, month, day-1);
    // Formatting the date into the desired format
    var formattedDate = (date.getDate() + 1) + "/" + date.getMonth() + "/" + date.getFullYear();
    return formattedDate
}