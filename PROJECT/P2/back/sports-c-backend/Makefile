CC      := gcc
CFLAGS  := -std=c11 -O2 -Wall -Wextra
TARGET  := sports

all: $(TARGET)

$(TARGET): sports.c
	$(CC) $(CFLAGS) -o $@ $<

run: $(TARGET)
	./$(TARGET)

clean:
	rm -f $(TARGET)

distclean: clean
	rm -rf data/

.PHONY: all run clean distclean
