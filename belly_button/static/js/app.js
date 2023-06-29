//1. Use the D3 library to read in samples.json 
const url = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json"

d3.json(url).then(function(response) {
    console.log(response);
    let samples_data = response.samples
    let meta_data = response.metadata
    let names_data = response.names

   //2. build the function to get the sorted data
   function valueSort (sampleArray){
    // creat an array for objects with otu_id, sample_value and otu_label
    let mappedSampleArray = sampleArray.otu_ids.map((otu_id,index)=>({
        otu_id,
        sample_value: sampleArray.sample_values[index],
        otu_label: sampleArray.otu_labels[index]
    })
        );
    // sort mapped array via sample_value
    mappedSampleArray.sort((a,b)=>b.sample_value-a.sample_value);
    // update the original array based on mapped array index
    sampleArray.otu_ids= mappedSampleArray.map(obj=>obj.otu_id)
    sampleArray.sample_values= mappedSampleArray.map(obj=>obj.sample_value)
    sampleArray.otu_labels= mappedSampleArray.map(obj=>obj.otu_label)
    // return result array
    return sampleArray
    };

    //3.  build a function getData() to getData for chart and a function getChart

    function getData(index){
        let sample_array = valueSort(samples_data[index]);
        return {
        bar:function(){let data ={
            type:"bar",
            x:sample_array.sample_values.slice(0,10).reverse(),
            y:sample_array.otu_ids.slice(0,10).map(otu_id => `OTU${otu_id}`).reverse(),
            text: sample_array.otu_labels.slice(0,10).reverse(),
            orientation: 'h'};
            return data},

        bubble:function(){let data2 = {
            x: sample_array.otu_ids,
            y: sample_array.sample_values,
            mode: 'markers',
            marker: {
                size:sample_array.sample_values,
                color:sample_array.otu_ids},
            text: sample_array.otu_labels};
            return data2},
        meta:function(){
            let id = samples_data[index].id
            let meta_index = meta_data.findIndex(obj => obj.id===Number(id))
            let data3 = meta_data[meta_index]
            return data3},
    }}
  
    function getCharts(index){
        /// horizontal chart
        /*  Create a horizontal bar chart with a dropdown menu to 
        display the top 10 OTUs found in that individual.*/
       
        let data =[getData(index).bar()]
        let layout = {
            height: 600,
            width: 800
          };
        Plotly.newPlot("bar", data, layout);
        /// bubble chart
        let data2 = [getData(index).bubble()]
          
        let layout2 = {
            title: 'sample OTD values',
            showlegend:false,
            height: 500,
            width: 1200
          };

        Plotly.newPlot("bubble",data2, layout2)

        /// demographic information
        let data3 = getData(index).meta()
        let metadataContainer = d3.select("#sample-metadata");

         Object.entries(data3).forEach(([key, value]) => {
              let row = metadataContainer.append("p");
              row.text(`${key}: ${value}`);
           });
    };



    //4.Creat Dropdown menu and change data on "change" 
    /// build the dropdownmenu based on id
    let dropdownContainer = d3.selectAll("#selDataset")
    ids = []
    for(i=0; i<samples_data.length; i++){
        let id = samples_data[i].id;
        dropdownContainer.append("option").attr("value",id).text(id)
    };

    /// Call optionChanged() when a change takes place to the DOM
    d3.selectAll("#selDataset").on("change", optionChanged);

    /// Function called by DOM changes
    function optionChanged() {
        // Retrieve the selected value from the dropdown menu
        let dropdownMenu = d3.select("#selDataset");
        let id = dropdownMenu.property("value");
        // Perform necessary actions based on the selected value

        let index = meta_data.findIndex(obj => obj.id===Number(id))

        let data3 = getData(index).meta()
        let metadataContainer = d3.select("#sample-metadata");
        metadataContainer.selectAll("p").remove();

         Object.entries(data3).forEach(([key, value]) => {
              let row = metadataContainer.append("p");
              row.text(`${key}: ${value}`);
           });

        let newbar = getData(index).bar();
        Plotly.restyle("bar", "x", [newbar.x]);
        Plotly.restyle("bar", "y", [newbar.y]);
        Plotly.restyle("bar", "text", [newbar.text]);

        let newbul = getData(index).bubble();
        Plotly.restyle("bubble", "x", [newbul.x]);
        Plotly.restyle("bubble", "y", [newbul.y]);
        Plotly.restyle("bubble", "marker", [newbul.marker]);
        Plotly.restyle("bubble", "text", [newbul.text]);
        console.log(newbul)

        

    };
    console.log(samples_data[2].id)

  //5. show the default data (first array in data)
  getCharts(0);
});
