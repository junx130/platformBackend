const nodeKey = [
    {type: 0, key: "battVoltage", name:"Battery"},
    {type: 0, key: "RSSI", name:"RSSI"},
    {type: 0, key: "SNR", name:"SNR"},
    {type: 1, key: "temperature", name:"Temperature"},
    {type: 1, key: "humidity", name:"Humidity"},
    {type: 2, key: "temperature", name:"Temperature"},
    {type: 3, key: "CurrentA", name:"Current A"},
    {type: 3, key: "CurrentB", name:"Current B"},
    {type: 3, key: "CurrentC", name:"Current C"},
    {type: 3, key: "VoltageA_B", name:"Voltage AB"},
    {type: 3, key: "VoltageB_C", name:"Voltage BC"},
    {type: 3, key: "VoltageC_A", name:"Voltage CA"},
    {type: 3, key: "DpmFrequency", name:"Frequency"},
    {type: 3, key: "ActivePower_A", name:"ActivePower A"},
    {type: 3, key: "ActivePower_B", name:"ActivePower B"},
    {type: 3, key: "ActivePower_C", name:"ActivePower C"},
    {type: 3, key: "ActivePower_Total", name:"ActivePower Total"},
    {type: 3, key: "PowerFactor_A", name:"Power Factor A"},
    {type: 3, key: "PowerFactor_B", name:"Power Factor B"},
    {type: 3, key: "PowerFactor_C", name:"Power Factor C"},
    {type: 3, key: "PowerFactor_Total", name:"Power Factor Total"},
    {type: 3, key: "ActiveEnergyDelivered", name:"Energy"},
    {type: 4, key: "mA", name:"Current"},
    {type: 4, key: "pressure", name:"Pressure"},
    {type: 1001, key: "FlowPHour", name:"Flow Rate"},
    {type: 1001, key: "RTD1", name:"Inlet Temperature"},
    {type: 1001, key: "RTD2", name:"Outlet Temperature"},
];


// const _nodeKey = nodeKey;
module.exports ={ nodeKey };