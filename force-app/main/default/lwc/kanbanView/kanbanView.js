import { LightningElement, wire } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import PROJECT_OBJECT from '@salesforce/schema/Project__c'
import getProjectName from '@salesforce/apex/UserStoryController.getProjectName';
import { NavigationMixin } from 'lightning/navigation';
import getTaskData from '@salesforce/apex/UserStoryController.getTaskData';
import getUserNames from '@salesforce/apex/UserStoryController.getUserNames';
import Id from '@salesforce/schema/Account.Id';

const cols = [
    { label: 'Profile Pic', fieldName: 'userPhoto', type:'image'},
    { label: 'Subject', fieldName: 'Id', type: 'url', typeAttributes: { label: { fieldName: 'Subject' } }  },
    { label: 'Due Date', fieldName: 'ActivityDate', type: 'date' },
]

export default class KanbanView extends LightningElement {
    selectedProject = "All"
    projectOptions = [];
    selectedAssignment = 'all'
    AssignedTo = []
    
    projectNames = [];
    showKanban = false;
    sDate = getStartOfMonth();
    eDate = getEndOfMonth();
    startDate = convertDateFormat(this.sDate);
    endDate = convertDateFormat(this.eDate)
    showChild = true;
    tasks=[];
    selectedUser;
    
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

@wire(getUserNames)
    wiredUserNames({error, data}) {
        if (data) {
            this.AssignedTo = data.map(name => {
                return { label: name, value: name };
            });
            this.AssignedTo.unshift({ label: 'Assigned to Me', value: 'assignedToMe' });
            this.AssignedTo.unshift({ label: 'All', value: 'all' });
            this.AssignedTo.push({ label: 'Assigned to Others', value: 'assignedToOthers' });
        } else if (error) {
            console.error('Error fetching user names', error);
        }
    }

mapTask(row){
    return {...row,
        Subject: `${row.Subject__c}`,
        Id: `https://cq-timesheet-dev-ed.develop.my.site.com/CQManagement/s/detail/${row.Id}`,
        ActivityDate : `${row.Due_Date__c}`,
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
        this.template.querySelector("c-kanban-column").handleProjectChange();
    }
    

    connectedCallback(){
        getProjectName()
        .then(result => {
            this.projectNames = ["All", ...result];
            console.log('this.projectNames'+ this.projectNames)
            console.log('selectedassignment'+ this.selectedAssignment)
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
        const contactId = this.record.Contact__c; // Replace with the actual contactId
    
        // Use NavigationMixin to navigate to the contact record page
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.records.Contact__r.Name,
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
    
    handleAssignmentChange(event){
        this.selectedAssignment = event.detail.value;
        console.log('selectedPAssignment' + this.selectedAssignment);
        // selectedUser = event.target.options.find(opt => opt.value === selectedValue).dataset.userid;
        
        // // Dispatch a custom event to notify the parent component
        // const selectedUserEvent = new CustomEvent('selecteduser', { detail: selectedUser });
        // console.log('selectedUser' + this.selectedUser);
        this.template.querySelector("c-kanban-column").handleProjectChange();
    }

    handleProjectChange(event) {
        this.selectedProject = event.detail.value;
        
        console.log('This.selectedProject' + this.selectedProject)
        this.showKanban = true;
        //console.log('selectedProject'+this.selectedProject)
        this.template.querySelector("c-kanban-column").handleProjectChange();
    }
    

    navigateToPrevious(event) {
        
        const sdates = new Date(this.sDate)
        const edates = new Date(this.eDate)
        sdates.setMonth(sdates.getMonth() - 1)
        edates.setDate(edates.getMonth() - 1)
        sdates.setDate(1); // Set the date to the 1st day of the month
        edates.setDate(0);
        //dates = dates.toISOString()
        this.sDate =  formatDateToYYYYMMDD(sdates)
        this.eDate = formatDateToYYYYMMDD(edates)
        this.startDate = convertDateFormat(this.sDate)
        this.endDate = convertDateFormat(this.eDate)
        //const startingDate = addDays(dates,7)
        //console.log(startingDate+'startingDate')
        //console.log('dates'+dates)
        console.log(this.sDate)
        console.log(this.eDate)
        this.template.querySelector("c-kanban-column").handleProjectChange();
      }
    
      navigateToNext() {
        const sdates = new Date(this.sDate)
        const edates = new Date(this.eDate)
        sdates.setMonth(sdates.getMonth() + 1)
        edates.setMonth(edates.getMonth() + 2)
        sdates.setDate(1); // Set the date to the 1st day of the month
        edates.setDate(0);
        //dates = dates.toISOString()
        this.sDate =  formatDateToYYYYMMDD(sdates)
        this.eDate = formatDateToYYYYMMDD(edates)
        this.startDate = convertDateFormat(this.sDate)
        this.endDate = convertDateFormat(this.eDate)
        //const startingDate = addDays(dates,7)
        //console.log(startingDate+'startingDate')
        //console.log('dates'+dates)
        console.log(this.sDate)
        console.log(this.eDate)
        this.template.querySelector("c-kanban-column").handleProjectChange();
    
        // this.setStartDate(_startDate);
        // this.handleRefresh();
      }
    
      navigateToDay() {
        
        //dates = dates.toISOString()
        this.sDate =  getStartOfMonth();
        this.eDate = getEndOfMonth(); 
        this.startDate = convertDateFormat(this.sDate)
        this.endDate = convertDateFormat(this.eDate)
        //const startingDate = addDays(dates,7)
        //console.log(startingDate+'startingDate')
        //console.log('dates'+dates)
        console.log(this.sDate)
        this.template.querySelector("c-kanban-column").handleProjectChange();
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
function getStartOfMonth() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 2);
    return startOfMonth.toISOString().split('T')[0];
}

function getEndOfMonth() {
    const today = new Date();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return endOfMonth.toISOString().split('T')[0];
}