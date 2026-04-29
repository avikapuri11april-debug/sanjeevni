#ifndef HOSPITAL_H
#define HOSPITAL_H

#include <vector>
#include <climits>
#include <map>
using namespace std;

struct Hospital {
    string name;
    string type;
    string category; // e.g. government, central, private
    bool available;
    string location;
    bool acceptsInsurance;
    bool supportsSurgery;
};

string getHospitalType(string condition) {

    for(int i=0;i<condition.length();i++)
        condition[i] = tolower(condition[i]);

    if(condition == "heart") return "cardiac";
    else if(condition == "accident") return "trauma";
    else if(condition == "cancer") return "oncology";
    else if(condition == "pregnancy") return "maternity";
    else if(condition == "brain") return "neuro";
    else if(condition == "surgery") return "surgery";

    return "general";
}

bool categoryMatches(string patientCategory, string hospitalCategory) {
    if(patientCategory == "private") return true;
    if(patientCategory == "government") return hospitalCategory == "government";
    return false;
}

// filter + nearest
Hospital findNearestHospital(vector<Hospital> hospitals,
                             string type,
                             string patientCategory,
                             bool insured,
                             int severity,
                             map<string,int> dist) {

    int minDist = INT_MAX;
    Hospital best = {"NoHospital","none","",false,"",false,false};
    bool critical = (severity >= 4);

    for(int i=0;i<hospitals.size();i++) {

        if(hospitals[i].type != type || !hospitals[i].available) {
            continue;
        }

        if(type == "surgery" && !hospitals[i].supportsSurgery) {
            continue;
        }

        bool categoryOk = critical ? true : categoryMatches(patientCategory, hospitals[i].category);
        bool insuranceOk = insured && hospitals[i].acceptsInsurance;

        if(!categoryOk && !insuranceOk) {
            continue;
        }

        if(dist[hospitals[i].location] < minDist) {
            minDist = dist[hospitals[i].location];
            best = hospitals[i];
        }
    }

    return best;
}

#endif