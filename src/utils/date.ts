export function fixDate(dateNr: number): number {
    // sometimes the date is in seconds and not ms
    if (new Date(dateNr).getFullYear() < 2000) {
        return dateNr * 1000;
    }

    return dateNr
}
