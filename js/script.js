let db = openDatabase("laba5", "1.0", "Lab 5 DB", 2 * 1024 * 1024);

db.transaction(function (t) {
     t.executeSql("CREATE TABLE IF NOT EXISTS groups (number INTEGER NOT NULL UNIQUE, lastname TEXT NOT NULL, quantity INTEGER NOT NULL, phone TEXT, address TEXT)");
     //t.executeSql("DROP table groups");
});

function addNewProperties() {
    let div = document.getElementById("mainInfo");
    div.insertAdjacentHTML("beforeend", "<select id=\"newProperty\" name=\"newProperty\"><option value=\"phone\">Телефон учителя</option><option value=\"address\">Адрес учителя</option></select>");
    div.insertAdjacentHTML("beforeend", "<input type=\"text\" placeholder=\"Значение\" id=\"property\" name=\"property\" required>");
    div.insertAdjacentHTML("beforeend", "<button class=\"red\" type=\"button\" id=\"removeAddInfo\" onclick=\"removeNewProperties()\">Удалить поле</button>");
    let button = document.getElementById("addInfo");
    //div.removeChild(button);
}

function removeNewProperties() {
    let div = document.getElementById("mainInfo");
    let key = document.getElementById("newProperty");
    let value = document.getElementById("property");
    let removeButton = document.getElementById("removeAddInfo");
    div.removeChild(key);
    div.removeChild(value);
    div.removeChild(removeButton);
}
class Group {

    constructor(group_number, lastname, student_quantity) {
        this._group_number = group_number;
        this._lastname = lastname;
        this._student_quantity = student_quantity;
    }

    get group_number() {
        return this._group_number;
    }

    get get_lastname() {
        return this._lastname;
    }

    get get_student_quantity() {
        return this._student_quantity;
    }

}
function addGroup() {
    let number = document.getElementById("classNumID").value;
    let lastname = document.getElementById("teacherNameID").value;
    let quantity = document.getElementById("amountOfStudentsID").value;
    let group = new Group(parseInt(number, 10), lastname, parseInt(quantity, 10));
    if (document.getElementById("newProperty")) {
        let newProperty = document.getElementById("newProperty").value;
        if (newProperty === "phone") {
            Group.prototype._phone;
            group._phone = document.getElementById("property").value;
        } else if (newProperty === "address") {
            Group.prototype._address;
            group._address = document.getElementById("property").value;
        }
    }
    insert(group, group.group_number);
}
function insert(group, number) {
    db.transaction(function (t) {
        t.executeSql("INSERT INTO groups (number, lastname, quantity) VALUES (?,?,?)",
            [group.group_number, group.get_lastname, group.get_student_quantity], success, error);
        if(group._phone!=undefined)
           t.executeSql("UPDATE groups set phone = ? where (number = ?)",
                [group._phone, number], success, error);
        if(group._address!=undefined)
          t.executeSql("UPDATE groups set address = ? where (number = ?)",
                [group._address, number], success, error);
    });
}
function success() {
    alert("Информация успешно добавлена!");
    document.getElementById("classNumID").value="";
    document.getElementById("amountOfStudentsID").value="";
    document.getElementById("teacherNameID").value="";
    if (document.getElementById("newProperty") != null && document.getElementById("property") != null) {
        removeNewProperties();
    }
}

function error(transaction, error) {
    alert("Произошла ошибка: " + error.message);
}

function loadTable() {
    if (db) {
        db.transaction(function (t) {
            t.executeSql("SELECT rowid, number, lastname, quantity, phone, address FROM groups",
                [], updateTable);
        })
    }
}
function updateTable(transaction, result) {
    let table = document.getElementById("groupTable");
    let select = document.getElementById("groupID");
    let properties = document.getElementById("groupProperties");
    properties.innerHTML = "<th>ID</th>\n" +
        "<th>Номер класса</th>\n" +
        "<th>Кол-во учащихся</th>" +
        "<th>ФИО классного руководителя</th>";
    let phone = false;
    let address = false;
    let number = table.rows.length;
    for (let i = 1; i < number; i++) {
        select.remove(0);
        table.deleteRow(1);
    }
    let rows = result.rows;
    for (let i = 0; i < rows.length; i++) {
        let row = rows.item(i);
        if (row.phone != null && !phone) {
            phone = true;
        }
        if (row.address != null && !address) {
            address = true;
        }
    }
    if (phone) {
        properties.insertAdjacentHTML("beforeend", "<th>Телефон</th>");
    }
    if (address) {
        properties.insertAdjacentHTML("beforeend", "<th>Адрес</th>");
    }
    for (let i = 0; i < rows.length; i++) {
        let row = rows.item(i);
        let tr = table.insertRow(-1);
        let group_id = tr.insertCell(0);
        group_id.innerText = row.rowid;
        let group_number = tr.insertCell(1);
        group_number.innerText = row.number;
        let quantity = tr.insertCell(2);
        quantity.innerText = row.quantity;
        let lastname = tr.insertCell(3);
        lastname.innerText = row.lastname;
        if (phone) {
            let phone_value = tr.insertCell(4);
            phone_value.innerText = row.phone;
        }
        if (address) {
            let index = phone ? 5 : 4;
            let address_value = tr.insertCell(index);
            address_value.innerText = row.address;
        }
        let option = document.createElement("option");
        option.value = row.rowid;
        option.innerText = row.rowid;
        select.appendChild(option);
    }
}
function deleteGroup() {
    let group_id = parseInt(document.getElementById("groupID").value, 10);
    if (db) {
        db.transaction(function (t) {
            t.executeSql("DELETE FROM groups WHERE rowid = ?",
                [group_id], updateTable);
        })
    }
}

function sortGroup() {
    if (db) {
        db.transaction(function (t) {
           t.executeSql("SELECT * FROM groups WHERE quantity = (SELECT MAX(quantity) from groups)",
                [], alertNumber);
            t.executeSql("SELECT * FROM groups WHERE quantity = (SELECT MIN(quantity) from groups)",
                [], alertNumber);
        })
    }
}

function alertNumber(transaction, result) {
    let rows = result.rows;
    let message = "Список преподавателей, в чьих классах минимальное и максимальное кол-во учащихся:\n";
    for (let i = 0; i < rows.length; i++) {
        let row = rows.item(i);
        message += "№ класса: ";
        message += row.number;
        message += " -> ";
        message += row.quantity;
        message += " учащихся";
        message += "\n";
        message += "ФИО: ";
        message += row.lastname;
        message += "\n";
        message += " ***";
        message += "\n";
    }
    alert(message);
}