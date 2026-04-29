#ifndef PATIENT_H
#define PATIENT_H

#include <iostream>
#include <fstream>
#include <queue>
#include <sstream>
#include "graph.h"
using namespace std;

struct Patient {
    string location;
    int severity;
    string condition;
    bool insured;
    string category; // hospital category preference
};

bool isValidPatient(const Patient &p) {
    bool validCategory = (p.category == "government" || p.category == "private" || p.category == "any");
    return !p.location.empty() && p.severity >= 1 && p.severity <= 5 && !p.condition.empty() && validCategory;
}

struct comparePatient {
    bool operator()(Patient a, Patient b) {
        return a.severity < b.severity;
    }
};

Patient inputPatient() {
    Patient p;
    int ins = -1;

    cout << "\nEnter Patient Details\n";

    do {
        cout << "Location: ";
        cin >> p.location;
        if(p.location.empty()) cout << "Location cannot be empty.\n";
    } while(p.location.empty());

    addNewLocation(p.location);

    do {
        cout << "Severity (1-5): ";
        cin >> p.severity;
        if(cin.fail() || p.severity < 1 || p.severity > 5) {
            cout << "Severity must be 1-5.\n";
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            p.severity = 0;
        }
    } while(p.severity < 1 || p.severity > 5);

    if(p.severity >= 4) {
        cout << "Critical patient\n";
        p.category = "any"; // not used for critical
    } else {
        cout << "Non-critical patient\n";
    }

    do {
        cout << "Condition: ";
        cin >> p.condition;
        if(p.condition.empty()) cout << "Condition cannot be empty.\n";
    } while(p.condition.empty());

    if(p.severity < 4) {
        do {
            cout << "Hospital preference (government/private): ";
            cin >> p.category;
            if(p.category != "government" && p.category != "private") {
                cout << "Enter government or private.\n";
                p.category.clear();
            }
        } while(p.category != "government" && p.category != "private");
    }

    do {
        cout << "Insurance (1=Yes,0=No): ";
        cin >> ins;
        if(cin.fail() || (ins != 0 && ins != 1)) {
            cout << "Enter 1 or 0.\n";
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            ins = -1;
        }
    } while(ins != 0 && ins != 1);

    p.insured = (ins == 1);

    return p;
}

bool patientExists(const Patient &p) {
    if(!isValidPatient(p)) return false;
    ifstream fin("patients.txt");
    Patient q;

    while(fin >> q.location >> q.severity >> q.condition >> q.category >> q.insured) {
        if(q.location == p.location && q.severity == p.severity &&
           q.condition == p.condition && q.category == p.category &&
           q.insured == p.insured) {
            return true;
        }
    }

    return false;
}

// save
void savePatientToFile(Patient p) {
    if(!isValidPatient(p)) {
        cerr << "Invalid patient, not saved.\n";
        return;
    }

    if(patientExists(p)) return; // avoid duplicates in file

    ofstream fout("patients.txt", ios::app);
    fout << p.location << " "
         << p.severity << " "
         << p.condition << " "
         << p.category << " "
         << p.insured << "\n";
    fout.close();
}

// load
void loadPatientsFromFile(priority_queue<Patient, vector<Patient>, comparePatient> &pq) {
    while(!pq.empty()) pq.pop(); // clear queue before loading

    ifstream fin("patients.txt");
    string line;

    while(getline(fin, line)) {
        if(line.empty()) continue;

        Patient p;
        istringstream iss(line);
        if(!(iss >> p.location >> p.severity >> p.condition >> p.category >> p.insured)) {
            cerr << "Skipping malformed line in patients.txt: '" << line << "'\n";
            continue;
        }

        if(!isValidPatient(p)) {
            cerr << "Skipping invalid patient data in patients.txt: '" << line << "'\n";
            continue;
        }

        pq.push(p);
    }

    fin.close();
}

// clear file
void clearFile() {
    ofstream fout("patients.txt");
    fout.close();
}

#endif