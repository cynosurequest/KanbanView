import { LightningElement, api } from 'lwc';

export default class DragAndDropList extends LightningElement {
    @api records
    @api stage
    handleItemDrag(evt){
        //console.log('Message From handleItemDrag')
        const event = new CustomEvent('listitemdrag', {
            detail:  evt.detail
        })
        this.dispatchEvent(event)
        //console.log('Message From handleItemDrag')
        
    }
    handleDragOver(evt){
        //console.log('Message From handleDragOver')
        evt.preventDefault()
        //console.log('Message From handleDragOver')
    }
    handleDrop(evt){
        console.log(this.stage + 'stage')
        const event = new CustomEvent('itemdrop', {
            detail:  this.stage 
        })
        //console.log(JSON.stringify(event)+'event')
        this.dispatchEvent(event)
        console.log(this.stage + 'stage')
        const callParentEvent = new CustomEvent(handleProjectChange());
        this.dispatchEvent(callParentEvent);
        console.log('done')
       // this.template.querySelector("c-drag-and-drop-lwc").handleProjectChange();
        //console.log('Message From handleDrop')
        
    }

    
}