export class AIProvider {
    constructor() {
        if (this.constructor === AIProvider) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    async generateTailoredResume(originalResume, jobDescription) {
        throw new Error("Method 'generateTailoredResume()' must be implemented.");
    }

    async generateCoverLetter(originalResume, jobDescription) {
        throw new Error("Method 'generateCoverLetter()' must be implemented.");
    }

    async calculateMatchScore(resumeText, jobDescription) {
        throw new Error("Method 'calculateMatchScore()' must be implemented.");
    }
}
