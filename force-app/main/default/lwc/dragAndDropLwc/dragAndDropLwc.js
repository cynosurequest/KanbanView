import { LightningElement, wire,api } from 'lwc';
import { getListUi } from 'lightning/uiListApi';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import TASK_OBJECT from '@salesforce/schema/Task'
import STATUS_FIELD from '@salesforce/schema/Task.Status'
import ID_FIELD from '@salesforce/schema/Task.Id'
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getTaskRecords from '@salesforce/apex/ProjectPicklistController.getTaskRecords';
import getPicklistNames from '@salesforce/apex/ProjectPicklistController.getPicklistNames';
//import getProjectRecords from '@salesforce/apex/ProjectPicklistController.getProjectRecords';
import updateTaskStatus from '@salesforce/apex/ProjectPicklistController.updateTaskStatus';
import getAllTask from '@salesforce/apex/ProjectPicklistController.getAllTask';


export default class DragAndDropLwc extends LightningElement {
    records
    pickVals
    recordId
    status
    @api projectName;
    showDropList = false;
    startDate1
    endDate1
    @api sDate
    @api eDate 
    // @wire(getListUi, {
    //     objectApiName: TASK_OBJECT
    // })wiredListView({error, data}){
    //     if(data){
    //         console.log("getListUi", data)
    //         try {
    //             getTaskRecords({projectName : this.projectName})
    //                 .then(result => {
    //                     this.records = result.map(item => {
    //                         return { 'Id': item.Id, 'ResourceName': item.Owner.Name, 'ProjectName': item.What.Name}
                        
    //                
                
                
    //             }) 
    //         } catch (error) {
    //             console.log('Hey I am an Error'+ error)
    //         }
            

            
    //     }
    //     if(error){
    //         console.error('hey'+error)
    //     }
    // }

    connectedCallback(){
        //setTimeout(() => {
        this.handleProjectChange();
    //}, 500);
            //this.addEventListener('projectchange', this.handleProjectChange.bind(this));
    }

    @api handleProjectChange() {
        setTimeout(() => {
        // getProjectRecords({projectName : this.projectName})
        // .then(result2 => {
        //     console.log('this.project'+ this.projectName)
        //     this.startDate1 = convertDateFormat(result2.startDate);
        //     this.endDate1 = convertDateFormat(result2.endDate);
        //     return getTaskRecords({projectName : this.projectName});
        // })

            console.log('Else Part')
            getTaskRecords({projectName : this.projectName, startDate: this.sDate, endDate: this.eDate})
                .then(result => {
                    console.log('result' + JSON.stringify(result))
                    this.showDropList = true;
                    this.records = result.map(item => ({
                        'Id': item.Id,
                        'ResourceName': item.Who.Name,
                        'ProjectName': item.What.Name,
                        'Status': item.Status,
                        'Subject': item.Subject,
                        'StartDate' :  convertDateFormat(item.Start_Date__c),
                        'EndDate' : convertDateFormat(item.End_Date__c),
                        'Contact' : item.Who.Id,
                        'PhotoUrl': item.PhotoUrl__c
                    }))
                    console.log('this.records' + JSON.stringify(this.records))
                    console.log('hi123'+ this.projectName)
                })
                
                .catch(error => { 
                    console.log(JSON.stringify(error));
                })
            

            getPicklistNames()
            .then(result => {
                this.pickVals = result;
            })
            .catch(error => {
                console.log(JSON.stringify(error));
            })
        }, 500);
            
    }



/** Fetch metadata abaout the opportunity object**/
// @wire(getObjectInfo, {objectApiName:TASK_OBJECT})
// objectInfo
// /*** fetching Stage Picklist ***/

//     @wire(getPicklistValues, {
//         fieldApiName:STATUS_FIELD
//     })stagePicklistValues({ data, error}){
//         if(data){
//             console.log("Status Picklist", data)
//             this.pickVals = data.values.map(item => item.value)
//             console.log("this.pickVals", this.pickVals)
//         }
//         if(error){
//             console.log('ddl error' + error)
//         }
//     }


    /****getter to calculate the  width dynamically*/
    get calcWidth(){
        let len = this.pickVals.length +1
        return `width: calc(100vw/ ${len})`
    }

    handleListItemDrag(event){
        this.recordId = event.detail
        //this.status = event.target.Name
    }

    handleItemDrop(event){
        this.status = event.detail
        console.log('records.status'+this.status)
        this.records = this.records.map(item=>{
            return item.Id === this.recordId ? {...item, status :this.status  }:{...item}
        })
        this.updateHandler(this.status)
    }

    updateHandler(status){
        
        updateTaskStatus({ recordId: this.recordId, status: status })
        .then(()=>{
            // if(this.projectName != 'All'){
            console.log("Updated Successfully 1")
            this.showToast()
            return getTaskRecords({projectName : this.projectName, startDate: this.sDate, endDate: this.eDate})
        // }
        //     else{
        //         console.log("Updated Successfully 2")
        //         this.showToast()
        //         return  getAllTask({startDate: this.sDate, endDate: this.eDate})
                
        //     }
        })
        .then(result => {
            //setTimeout(() => {
            this.records = result.map(item => ({
                'Id': item.Id,
                'ResourceName': item.Who.Name,
                'ProjectName': item.What.Name,
                'Status': item.Status,
                'Subject': item.Subject,
                'StartDate' : convertDateFormat(item.Start_Date__c),
                'EndDate' : convertDateFormat(item.End_Date__c),
                'Contact' : item.Who.Id
            }));
            console.log(this.status+'status')
            console.log(JSON.stringify(this.records)+ 'records')
        })
        // .catch(error=>{
        //     console.error("Error updating record: " + error)
        // })
    //},500)
    }

    showToast(){
        this.dispatchEvent(
            new ShowToastEvent({
                title:'Success',
                message:'Stage updated Successfully',
                variant:'success'
            })
        )
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