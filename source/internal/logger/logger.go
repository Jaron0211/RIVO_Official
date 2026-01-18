package logger

import (
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"time"
)

var (
	infoLogger   *log.Logger
	warnLogger   *log.Logger
	errLogger    *log.Logger
	actionLogger *log.Logger
	logDir       string
)

// Init initializes the logging system
func Init() error {
	startTime := time.Now().Format("20060102_150405")
	logDir = filepath.Join("logs", startTime)

	if err := os.MkdirAll(logDir, 0755); err != nil {
		return fmt.Errorf("failed to create log directory: %w", err)
	}

	infoFile, err := os.OpenFile(filepath.Join(logDir, ".INFO"), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return err
	}
	warnFile, err := os.OpenFile(filepath.Join(logDir, ".WARNING"), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return err
	}
	errFile, err := os.OpenFile(filepath.Join(logDir, ".ERROR"), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return err
	}
	actionFile, err := os.OpenFile(filepath.Join(logDir, ".ACTION"), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return err
	}

	// Create multi-writers to log to both file and console
	infoWriter := io.MultiWriter(os.Stdout, infoFile)
	warnWriter := io.MultiWriter(os.Stdout, warnFile)
	errWriter := io.MultiWriter(os.Stderr, errFile)
	actionWriter := actionFile

	infoLogger = log.New(infoWriter, "INFO: ", log.Ldate|log.Ltime|log.Lshortfile)
	warnLogger = log.New(warnWriter, "WARNING: ", log.Ldate|log.Ltime|log.Lshortfile)
	errLogger = log.New(errWriter, "ERROR: ", log.Ldate|log.Ltime|log.Lshortfile)
	actionLogger = log.New(actionWriter, "", log.Ldate|log.Ltime)

	return nil
}

func Action(method, path, remoteAddr string, status int, duration time.Duration) {
	if actionLogger == nil {
		return
	}
	actionLogger.Printf("[%d] %s %s from %s took %v", status, method, path, remoteAddr, duration)
}

func Info(v ...interface{}) {
	if infoLogger == nil {
		log.Print(v...)
		return
	}
	infoLogger.Output(2, fmt.Sprint(v...))
}

func Infof(format string, v ...interface{}) {
	if infoLogger == nil {
		log.Printf(format, v...)
		return
	}
	infoLogger.Output(2, fmt.Sprintf(format, v...))
}

func Warn(v ...interface{}) {
	if warnLogger == nil {
		log.Print(v...)
		return
	}
	warnLogger.Output(2, fmt.Sprint(v...))
}

func Warnf(format string, v ...interface{}) {
	if warnLogger == nil {
		log.Printf(format, v...)
		return
	}
	warnLogger.Output(2, fmt.Sprintf(format, v...))
}

func Error(v ...interface{}) {
	if errLogger == nil {
		log.Print(v...)
		return
	}
	errLogger.Output(2, fmt.Sprint(v...))
}

func Errorf(format string, v ...interface{}) {
	if errLogger == nil {
		log.Printf(format, v...)
		return
	}
	errLogger.Output(2, fmt.Sprintf(format, v...))
}

func Fatal(v ...interface{}) {
	Error(v...)
	os.Exit(1)
}

func Fatalf(format string, v ...interface{}) {
	Errorf(format, v...)
	os.Exit(1)
}
