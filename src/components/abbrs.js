//import React from 'react';
//import ReactDOM from 'react-dom';
//import { HotTable } from '@handsontable/react';
//import Handsontable from 'handsontable';

import React from "react"
import XLSX from "xlsx"
import SampleAbbrFile from '../static/abbrs.xlsx'
import { HotTable } from '@handsontable/react';

class AbbrTools extends React.PureComponent{
    constructor(props){
        super(props);
        this.fileInputRef = React.createRef();
    }
    importSampleAbbrs = ()=>{
        return new Promise((res,rej)=>{
            const xhttp = new XMLHttpRequest();
            xhttp.responseType = 'blob';
            xhttp.onload = ()=>{
                res(xhttp.response);
            }
            xhttp.open('GET',SampleAbbrFile,true);
            xhttp.send();
        }).then(this.getDataFromXLS);        
    }
    importAbbrs = (e) => {
        
        if(!this.fileInputRef.current.value){
            console.log('no file picked');
            return;
        }else{
            this.getDataFromXLS(this.fileInputRef.current.files[0]);
            this.fileInputRef.current.value = '';
        }
        
    }
    getDataFromXLS = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target.result;
            const workbook = XLSX.read(data,{
                type:'binary',
                raw:true,
            });
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]],
                {'header':['enabled','value','abbr']});
            this.props.updater(rows)
        };
        reader.readAsBinaryString(file)
    }
    exportToXLS = ()=>{
        const wb = XLSX.utils.book_new();
        const sht  = XLSX.utils.aoa_to_sheet(this.props.getter());
        XLSX.utils.book_append_sheet(wb,sht,'abbrs')
        XLSX.writeFile(wb,'abbrs.xlsx');
    }
    inputClick = () => {
        this.fileInputRef.current.click();
    }
    render(){

        return (
            <div className='toolbox'>
                <input type="file" onChange={this.importAbbrs} ref={this.fileInputRef} style={{display:"none"}}></input>
                <button className="button" onClick={this.inputClick}>Import Abbrs</button>
                <button className="button" onClick={this.exportToXLS}>Export Abbrs</button>
                <button className="button" onClick={() => { 
                    if(window.confirm("Are you sure you want to remove all existing acronyms and replace with a common list?")){
                        this.importSampleAbbrs();
                    }
                }}>Load Common Abbrs</button>
            </div>
        );
    }
}
class AbbrsViewer extends React.PureComponent {
    constructor(props) {
        super(props);
        this.tableRef = React.createRef();
    }

    handleAbbrChange = (type) => {
        return (e)=>{
            this.props.onAbbrChange(this.tableRef);   
        }
    }
    reloadData = (rows)=>{
        //this.tableRef.current.hotInstance.updateSettings({data:[]});
        this.tableRef.current.hotInstance.alter("remove_row",0, this.tableRef.current.hotInstance.countRows())
        this.tableRef.current.hotInstance.loadData(rows);
    }
    getData = ()=>{
        return this.tableRef.current.hotInstance.getData();
    }
    render() {
        
        return (
            <div>
                <AbbrTools updater={this.reloadData} getter={this.getData}/>
                <HotTable settings={this.props.settings}  data={this.props.abbrData}
                ref={this.tableRef} 
                afterChange={this.handleAbbrChange('afterchange')}
                afterPaste={this.handleAbbrChange('afterpaste')}
                afterRemoveRow={this.handleAbbrChange('afterremoverow')}
                afterUpdateSettings={this.handleAbbrChange('afterupdatesettings')}/>
            </div>
        );
    }
}

export default AbbrsViewer;
