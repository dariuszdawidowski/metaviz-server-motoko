/**
 * Remove from string all unusual characters
 * @param input: string
 */

export const cleanString = (input) => {
    const regex = /[^\p{L}\p{N}\s_-]/gu;
    return input.replace(regex, '');
};
