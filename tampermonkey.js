// ==UserScript==
// @name         Improved HeatList
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://www.comp-mngr.com/*_HeatLists.htm
// @icon         https://www.google.com/s2/favicons?sz=64&domain=comp-mngr.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    class Couple {
        constructor(a, b) {
            if (b < a) {
                [a, b] = [b, a];
            }
            this.fullNames = a + ' & ' + b;
            this.canonical = a.split(', ')[1] + ' & '+ b.split(', ')[1];
        }

        toString() {
            return this.fullNames;
        }
    }

    class Heat {
        constructor(number, time, name) {
            this.number = number;
            this.time = time;
            this.name = name;
            this.couples = [];
        }

        toString() {
            return this.number + this.name;
        }

        containsPerson(person) {
            for (const couple of this.couples) {
                if (couple.fullNames.includes(person)) {
                    return true;
                }
            }
            return false;
        }
    }

    function switchToHeats() {
        var heatsTable = document.getElementById('ihl-heats-table');

        heatsTable.style.display = 'block';
        var peopleTable = $('#block_menu table')[2];
        peopleTable.style.display = 'none';
    }
    function switchToPeople() {
        var heatsTable = document.getElementById('ihl-heats-table');

        heatsTable.style.display = 'none';
        var peopleTable = $('#block_menu table')[2];
        peopleTable.style.display = 'block';
    }

    var selected = {};
    var heats = {};
    var heatsForCouple = {};
    var couplesPerHeat = {};

    function buildTableOfHeats() {
        var table = document.createElement('table');
        var thead = document.createElement('thead');
        table.id = 'ihl-heats-table';
        var headerRow = document.createElement('tr');
        var td1 = document.createElement('td');
        td1.textContent = 'Heat#';
        td1.class = 'heatNo';
        var td2 = document.createElement('td');
        td2.textContent = 'Heat Name';
        td2.class = 'heatName';
        var td3 = document.createElement('td');
        td3.textContent = 'Couple';
        td3.class = 'couple';
        headerRow.appendChild(td1);
        headerRow.appendChild(td2);
        headerRow.appendChild(td3);
        thead.appendChild(headerRow);
        table.appendChild(thead);
        return table;
    }

    function buildHeatRows(heat, couples) {
        var result = [];
        var firstRow = true;
        for (const couple of couples) {

            var row = document.createElement('tr');
            var td1 = document.createElement('td');
            var td2 = document.createElement('td');
            var td3 = document.createElement('td');
            row.appendChild(td1);
            row.appendChild(td2);
            row.appendChild(td3);

            if (firstRow) {
                td1.textContent = heat.number;
                td2.textContent = heat.name;
            }
            td3.textContent = couple.canonical;

            result.push(row);
            firstRow = false;
        }
        return result;
    }

    function buildHeatList() {
            console.log('building');
            //var h = new Heat('heat 1', '6pm', 'Silver Latin Senio 1');
            //var h2 = new Heat('heat 1', '6pm', 'Silver Latin Senio 1');
            //heatSet.add(h);
            //heatSet.add(h2);
            //console.log('how many : ' + heatSet.size);
            //h.couples.push(new Couple('andy a', 'betty b'));
            //h.containsPerson('charlie c');

            $('div').each(function (index, element) {
                if (element.id.startsWith('TABLE_CODE_')) {
                    var competitor = null;
                    var partner = null;
                    var couple = null;
                    for (const child of element.children) {
                        //console.log(child.tagName);
                        if (child.tagName == 'STRONG') {
                            if (child.textContent.startsWith("Entries for ")) {
                                competitor = child.textContent.substring(12);
                            } else if (child.textContent.startsWith("With ")) {
                                partner = partner = child.textContent.substring(5);
                                couple = new Couple(competitor, partner);
                                //console.log("couple " + couple.canonical);
                            }
                        }
                        if (child.tagName == 'TABLE') {
                            //console.log('table found');
                            var rows = $(child).find('tr');
                            for (const row of Array.from(rows).slice(1)) {
                                var heat = new Heat(row.children[2].textContent, // number
                                                     row.children[0].textContent, // time
                                                     row.children[3].textContent  // category
                                );
                                if (!heatsForCouple[couple]) {
                                    //console.log('initializing for ' + couple);
                                    heatsForCouple[couple] = [];
                                    //console.log('done init');
                                }
                                heatsForCouple[couple.toString()].push(heat);

                                //console.log('adding heat' + heat);
                                if (!heats[heat.toString()]) {
                                    heats[heat.toString()] = heat;
                                } else {
                                    heat = heats[heat.toString()];
                                }
                                heat.couples.push(couple);

                                // couples per heat
                                if (!couplesPerHeat[heat.toString()]) {
                                    couplesPerHeat[heat.toString()] = {};
                                }
                                couplesPerHeat[heat.toString()][couple.toString()] = couple;
                            }
                        }
                    }
                }

            });
            // print
            console.log('printing');
            var heatList = Object.values(heats);
            console.log(heatList[0]);
            heatList.sort(function (a, b) {
                [a, b] = [parseInt(a.number.split(" ")[1]), parseInt(b.number.split(" ")[1])];
                //console.log(a + ' ?< ' + b);
                return a - b;
            });
            var interestingHeats = new Set();
            for (const heat of heatList) {
                for (const person of Object.keys(selected)) {
                    if (heat.containsPerson(person)) {
                        interestingHeats.add(heat);
                        console.log(heat.number + " is interesting");
                    }
                }

            }
            var heatTable = buildTableOfHeats();
            for (const heat of interestingHeats) {
                // intersting couples per heat
                heatTable.append(...buildHeatRows(heat, Object.values(couplesPerHeat[heat.toString()])));

                //console.log(heat);
            }
            var oldTable = document.getElementById('ihl-heats-table');
            oldTable.replaceWith(heatTable);
            console.log('Done building heat list');
        }

    (async () => {
        await import('https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js')
        // Library ready
        console.log(jQuery)

        var blockMenu = document.getElementById('block_menu');

        var heatsTable = document.createElement('table');
        heatsTable.id = 'ihl-heats-table';
        blockMenu.insertBefore(heatsTable, blockMenu.firstChild);

        var selectElem = document.createElement('td');
        selectElem.textContent = 'select dancers';
        $(selectElem).on('click', {}, switchToPeople);
        var heatsElem = document.createElement('td');
        heatsElem.textContent = 'see heats';
        $(heatsElem).on('click', {}, switchToHeats);

        var topTable = document.createElement('table');
        topTable.id = 'ihl-top-table';
        topTable.appendChild(selectElem);
        topTable.appendChild(heatsElem);
        
        blockMenu.insertBefore(topTable, blockMenu.firstChild);


        function selectDancer(event) {
            var target = event.target;
            var name = event.data.dancerName;
            if (selected[name]) {
                delete selected[name];
                target.textContent = 'select';
            } else {
                selected[name] = true;
                target.textContent = 'SELECTED';
            }
            console.log(selected);
            buildHeatList();
        }

        $('#block_menu table tr').each(function (index) {
            var dancerName = this.childNodes[0].textContent;
            var newTd = document.createElement('td');
            var newButton = document.createElement('button');
            $(newButton).on('click', {dancerName: dancerName}, selectDancer);
            console.log(this.text);
            newButton.textContent = 'select';
            //newButton.textContent = this.childNodes[0].textContent;
            newTd.appendChild(newButton);
            console.log(this.appendChild(newTd));
        })

    })();

})();
