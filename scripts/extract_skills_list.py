import os
import json

def extract_value_list_from_json(json_file: str):
    """Parse JSON file and return a unique, sorted list of values across entries."""
    with open(json_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Flatten lists of values across all entries
    all_values = []
    for values in data.values():
        all_values.extend(values)

    # Deduplicate + sort
    unique_values = sorted(set(all_values))
    return unique_values


if __name__ == "__main__":
    # Get the directory where this script lives
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # Construct paths relative to this script’s directory
    input_file = os.path.join(script_dir, "..", "data", "career_item_tags.json")
    output_file = os.path.join(script_dir, "..", "data", "unique_skills.txt")

    # Extract values
    skills = extract_value_list_from_json(input_file)

    print(f"Total unique skills: {len(skills)}\n")
    for s in skills:
        print(s)

    # Write to output file
    with open(output_file, "w", encoding="utf-8") as f:
        for skill in skills:
            f.write(f"{skill}\n")

    print(f"\nUnique skills written to: {output_file}")