import os
import random

MAX_JUMP = 200

def generate_level_files():
    for i in range(46, 450):
        filename = f"levels/level{i}.level"

        # Create file with content
        with open(filename, 'w') as f:
            f.write(generate_new_level())

        print(f"Created: {filename} with content")


def generate_new_level():

    level_data = ""

    # Theme decider

    theme_odds = random.randint(1, 100)
    if theme_odds < 20:
        level_data = "theme,1;"
    elif theme_odds < 40:
        level_data = "theme,2;"
    elif theme_odds < 60:
        level_data = "theme,3;"
    elif theme_odds < 80:
        level_data = "theme,4;"
    else:
        level_data = "theme,5;"

    level_data += "platform,0,360,200,30,no;"
    x_pointer = 250
    y_pointer = 360

    while x_pointer < 2500:
        to_add = ""

        type_odds = random.randint(1, 100)
        if type_odds < 75:
            # PLATFORM
            to_add += "platform,"

            width = random.randint(100, 200)
            height = 30

            x = x_pointer
            y = random.randint((y_pointer - MAX_JUMP), 370)
            if y < 100:
                y = 100

            to_add += str(x) + "," + str(y) + "," + str(width) + "," + str(height) + ","

            if type_odds > 40:
                to_add += "badguy;"
            else:
                to_add += "no;"

            x_pointer += width + 100
            y_pointer = y
            level_data += to_add
        else:
            level_data += "firecol," + str(x_pointer) + ";"
            x_pointer += 50

    level_data += "finish," + str(x_pointer + MAX_JUMP) + ";"

    return level_data

# Run the function
if __name__ == "__main__":
    generate_level_files()