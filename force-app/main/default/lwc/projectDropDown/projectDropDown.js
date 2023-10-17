import { LightningElement, wire } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import PROJECT_OBJECT from '@salesforce/schema/Project__c'
import getProjectName from '@salesforce/apex/ProjectPicklistController.getProjectName';
import { NavigationMixin } from 'lightning/navigation';
import getTaskData from '@salesforce/apex/ProjectPicklistController.getTaskData';
//import getUserNames from '@salesforce/apex/UserStoryController.getUserNames'

const cols = [
    { label: 'Profile Pic', fieldName: 'userPhoto', type:'image'},
    { label: 'Subject', fieldName: 'Id', type: 'url', typeAttributes: { label: { fieldName: 'Subject' } }  },
    { label: 'Due Date', fieldName: 'ActivityDate', type: 'date' },
]

export default class ProjectDropDown extends LightningElement {
    selectedProject = 'All'
    projectOptions = [];
    projectNames = [];
    showKanban = false;
    sDate = getTodaysDate();
    eDate = getDateAfterAWeek();
    startDate = convertDateFormat(this.sDate);
    endDate = convertDateFormat(this.eDate)
    showChild = true;
    tasks=[];
    
    columns = cols;
    @wire(getTaskData)
  wiredAccount({ error, data }) {
    if (data) {
        console.log('data'+JSON.stringify(data))
        this.tasks = data
        this.tasks = data.map((row) => {
            return this.mapTask(row);
        })
    //   this.record = data;
    //   this.error = undefined;
    } else if (error) {
        console.log('error'+JSON.stringify(error))
    //   this.error = error;
    //   this.record = undefined;
    }
  }
// @wire(getTaskData)
// tasks;

mapTask(row){
    return {...row,
        Subject: `${row.Subject}`,
        Id: `https://cq-timesheet-dev-ed.develop.my.site.com/CQManagement/s/detail/${row.Id}`,
        ActivityDate : `${row.ActivityDate}`,
        userPhoto: `${row.PhotoUrl__c}`
    };
}
    
    handleStartDateChange(event) {
        this.sDate = event.target.value;
        console.log('sDate'+this.sDate)
        this.startDate = convertDateFormat(this.sDate);
    }

    handleEndDateChange(event) {
        this.eDate = event.target.value;
        console.log('eDate'+this.eDate)
        this.endDate = convertDateFormat(this.eDate);
        this.template.querySelector("c-drag-and-drop-lwc").handleProjectChange();
    }
    

    connectedCallback(){
        getProjectName()
        .then(result => {
            this.projectNames = ["All", ...result];
            console.log('this.projectNames'+ this.projectNames)
            this.projectOptions = this.projectNames.map((item) => {
                return {
                    label: item,
                    value: item
                };
            })
            this.handleProjectChange({
                detail: { value: this.selectedProject }
            });
            //console.log('ptoject options'+ this.projectOptions)
            console.log('sDate'+ this.sDate)
            console.log('eDate'+ this.eDate)
        })
        .catch(error => {
            // Handle error response
            console.log(JSon.stringify(error));
        })
    }

    

    redirectToContact() {q
        // Assuming you have a variable containing the contactId
        const contactId = this.record.Contact; // Replace with the actual contactId
    
        // Use NavigationMixin to navigate to the contact record page
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.tasks.Who.Name,
                objectApiName: 'Contact',
                actionName: 'view'
            }
        });
    }

    handleSubjectClick(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        const recordId = row.Id;

        if (actionName === 'view_contact') {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: recordId,
                    actionName: 'view'
                }
            });
        }
    }
    

    handleProjectChange(event) {
        this.selectedProject = event.detail.value;
        this.showKanban = true;
        //console.log('selectedProject'+this.selectedProject)
        this.template.querySelector("c-drag-and-drop-lwc").handleProjectChange();
    }
    

    navigateToPrevious(event) {
        
        // this.sDate = getDateAfterAWeek();
        // this.startDate = convertDateFormat(this.sDate);
        // console.log('this.startDate'+ this.startDate);
        // newd1 = '2023-09-20'
        // newd2 = subtractDaysFromDate(newd1)
        // console.log(newd2)
        const sdates = new Date(this.sDate)
        const edates = new Date(this.eDate)
        sdates.setDate(sdates.getDate()-7)
        edates.setDate(edates.getDate()-7)
        //dates = dates.toISOString()
        this.sDate =  formatDateToYYYYMMDD(sdates)
        this.eDate = formatDateToYYYYMMDD(edates)
        this.startDate = convertDateFormat(this.sDate)
        this.endDate = convertDateFormat(this.eDate)
        //const startingDate = addDays(dates,7)
        //console.log(startingDate+'startingDate')
        //console.log('dates'+dates)
        console.log(this.sDate)
        this.template.querySelector("c-drag-and-drop-lwc").handleProjectChange();
      }
    
      navigateToNext() {
        const sdates = new Date(this.sDate)
        const edates = new Date(this.eDate)
        sdates.setDate(sdates.getDate()+7)
        edates.setDate(edates.getDate()+7)
        //dates = dates.toISOString()
        this.sDate =  formatDateToYYYYMMDD(sdates)
        this.eDate = formatDateToYYYYMMDD(edates)
        this.startDate = convertDateFormat(this.sDate)
        this.endDate = convertDateFormat(this.eDate)
        //const startingDate = addDays(dates,7)
        //console.log(startingDate+'startingDate')
        //console.log('dates'+dates)
        console.log(this.sDate)
        this.template.querySelector("c-drag-and-drop-lwc").handleProjectChange();
    
        // this.setStartDate(_startDate);
        // this.handleRefresh();
      }
    
      navigateToDay() {
        // this.setStartDate(new Date(event.target.value + "T00:00:00"));
        // this.handleRefresh();
        this.sDate = getTodaysDate();
        this.eDate = getDateAfterAWeek();
        this.startDate = convertDateFormat(this.sDate);
        this.endDate = convertDateFormat(this.eDate)
        this.template.querySelector("c-drag-and-drop-lwc").handleProjectChange();
      }
}
function convertDateFormat(inputDate) {
    // Split the input string into an array using "-" as the delimiter
    var dateParts = inputDate.split("-");
    
    // Create a new Date object using year, month, and day
    var dateObject = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    
    // Get day, month, and year from the date object
    var day = dateObject.getDate();
    var month = dateObject.getMonth() + 1;
    var year = dateObject.getFullYear();
    
    // Pad day and month with leading zeros if needed
    day = day < 10 ? '0' + day : day;
    month = month < 10 ? '0' + month : month;
    
    // Construct the new date string in dd/mm/yyyy format
    var newDateFormat = day + '/' + month + '/' + year;
    
    return newDateFormat;
}

function getTodaysDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-based, so add 1
    const day = String(today.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

function getDateAfterAWeek() {
    let currentDate = new Date();
    let nextWeekDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Extract year, month, and day from the date
    let year = nextWeekDate.getFullYear();
    let month = String(nextWeekDate.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed
    let day = String(nextWeekDate.getDate()).padStart(2, '0');
  
    // Return formatted date string (YYYY-MM-DD)
    return `${year}-${month}-${day}`;
  }

  function formatDateToYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  

  